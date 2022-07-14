import axios from 'axios'
import memoize from 'memoizee'
import { namehash } from '@ethersproject/hash'
import {
  ENSPublicResolver__factory,
  Multicall2,
  Multicall2__factory,
} from '../../generated/contracts'
import { StaticJsonRpcProvider } from '@ethersproject/providers'

import { AddressZero } from '@ethersproject/constants'
interface ENSProfileText {
  text: string
  value: string
}

export interface ENSProfile {
  name: string
  owner: {
    address: string
  }
  texts: ENSProfileText[]
}

const ENSPublicResolver_ADDRESS = '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41'

const memoizedENSNamehash = memoize(namehash)

export async function getENSProfile(ensName: string): Promise<ENSProfile> {
  const ensProfile: ENSProfile = {
    name: ensName,
    owner: {
      address: AddressZero,
    },
    texts: [],
  }

  const ensNameHash = memoizedENSNamehash(ensName)

  const { data } = await axios.post(
    'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    {
      query: `{
        domain(id: "${ensNameHash}") {
          owner {
            address: id
          }
          name
          resolver {
            texts
          }
        }
      }`,
    },
  )

  // Exit if no data is returned
  if (data.data == null || data.data.domain === null) {
    throw new Error('ENS profile not found')
  }

  if (data.data.domain.owner.address !== AddressZero) {
    ensProfile.owner.address = data.data.domain.owner.address
  }

  // Fetch domain texts from the resolver
  const domainTexts: string[] = data.data?.domain?.resolver?.texts ?? []

  console.log('domainTexts', domainTexts)

  if (domainTexts.length > 0) {
    try {
      const texts = await getENSTextsFromPublicResolver(ensName, domainTexts)
      if (texts.length > 0) {
        ensProfile.texts = texts
      }
    } catch (error) {
      console.error(error)
    }
  }

  return ensProfile
}

export async function getENSTextsFromPublicResolver(
  ensName: string,
  domainTexts: string[],
): Promise<ENSProfileText[]> {
  const ensNameHash = namehash(ensName)

  if (process.env.MAINNET_RPC === undefined) {
    throw new Error('MAINNET_RPC environment variable is not set')
  }

  const provider = new StaticJsonRpcProvider(process.env.MAINNET_RPC)

  const multicallContract = Multicall2__factory.connect(
    '0xcA11bde05977b3631167028862bE2a173976CA11',
    provider,
  )

  const ensPublicResolverContractInterface = ENSPublicResolver__factory.createInterface()

  const multicallCallStrcut: Multicall2.CallStruct[] = domainTexts.map(
    (text: string) => ({
      callData: ensPublicResolverContractInterface.encodeFunctionData('text', [
        ensNameHash,
        text,
      ]),
      target: ENSPublicResolver_ADDRESS,
    }),
  )

  const multicallCallData = await multicallContract.callStatic.tryAggregate(
    false,
    multicallCallStrcut,
  )

  const texts: ENSProfileText[] = domainTexts.reduce(
    (acc, text: string, index) => {
      if (multicallCallData[index].success) {
        const textValue = ensPublicResolverContractInterface.decodeFunctionResult(
          'text',
          multicallCallData[index].returnData,
        )[0] as string

        if (textValue.trim() !== '') {
          acc.push({
            text,
            value: textValue,
          })
        }
      }

      return acc
    },
    [] as ENSProfileText[],
  )

  return texts
}
