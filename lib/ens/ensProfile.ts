import axios from 'axios'
import { namehash } from '@ethersproject/hash'
import {
  ENSPublicResolver__factory,
  Multicall2,
  Multicall2__factory,
} from '../../generated/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

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

export async function getENSProfile(ensName: string): Promise<ENSProfile> {
  const ensNameHash = namehash(ensName)

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

  const provider = new JsonRpcProvider(process.env.MAINNET_RPC)

  const multicallContract = Multicall2__factory.connect(
    '0xcA11bde05977b3631167028862bE2a173976CA11',
    provider,
  )

  const domainTexts: string[] = data.data.domain.resolver.texts ?? []

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
        )[0]

        acc.push({
          text,
          value: textValue,
        })
      }

      return acc
    },
    [] as ENSProfileText[],
  )

  const profile: ENSProfile = {
    name: ensName,
    owner: data.data.domain.owner,
    texts,
  }

  return profile
}
