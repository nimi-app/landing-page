import React from 'react'
import {
  createGlobalStyle,
  css,
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components'

import backgroundImageUrl from '../assets/images/nimi-header-background.png'
import { Colors } from './styled'

export const MEDIA_WIDTHS = {
  fromExtraSmall: 500,
  fromSmall: 720,
  fromMedium: 960,
  fromLarge: 1280,
}

const mediaWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (min-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `
  return accumulator
}, {}) as any

const white = '#FFFFFF'
const black = '#000000'

export function colors(darkMode = false): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#14131D',
    text2: darkMode ? '#EBE9F8' : '#464366',
    text3: darkMode ? '#DDDAF8' : '#8E89C6',
    text4: darkMode ? '#C0BAF6' : '#A7A0E4',
    text5: darkMode ? '#8780BF' : '#C0BAF6',
    text6: '#504D72',

    // backgrounds / greys
    bg1: darkMode ? '#191A24' : '#FFFFFF',
    bg1And2: darkMode ? '#1D202F' : '#FFFFFF',
    bg2: darkMode ? '#2A2F42' : '#EBE9F8',
    bg3: darkMode ? '#3E4259' : '#DDDAF8',
    bg4: darkMode ? '#686E94' : '#C0BBE9',
    bg5: darkMode ? '#9096BE' : '#7873A4',
    bg6: '#171621',
    bg7: '#2D3040',
    bg8: '#191A24',
    shadow1: '#2F80ED',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#2E17F2' : '#551a8b',
    primary2: darkMode ? '#3680E7' : '#F9F5FF',
    primary3: darkMode ? '#4D8FEA' : '#D4C2FC',
    primary4: darkMode ? '#376bad70' : '#998FC7',
    primary5: darkMode ? '#153d6f70' : '#D6D3D9',

    // color text
    primaryText1: darkMode ? '#6da8ff' : '#551a8b',

    // secondary colors
    secondary1: darkMode ? '#2172E5' : '#551a8b',
    secondary2: darkMode ? '#17000b26' : '#998FC7',
    secondary3: darkMode ? '#17000b26' : '#D4C2FC',

    // other
    red1: '#F02E51',
    red2: '#F82D3A',
    orange1: '#f2994a',
    green1: '#27AE60',
    green2: '#0E9F6E',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#2172E5',
    gray1: '#737798',
    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

    // new UI refactor colors
    mainPurple: '#2E17F2',
    purpleBase: '#101016',
    purpleOverlay: '#111018',
    purple2: '#C0BAF6',
    purple3: '#8780BF',
    purple4: '#685EC6',
    purple5: '#464366',
    boxShadow: '#0A0A0F',

    // darkest // dark 1.1
    darkest: '#161721',
    dark1: '#191824',
    dark2: '#2A2F42',
  }
}

export function theme(): DefaultTheme {
  return {
    ...colors(),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsThemeProvider theme={theme()}>
      {children}
    </StyledComponentsThemeProvider>
  )
}

export const FixedGlobalStyle = createGlobalStyle`

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

html, body, input, label, textarea, button {
  font-family: 'Archivo', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Archivo', sans-serif;
}

body {
  background-color:#F5F7FF;
  background-position: center;
  background-size: cover;
}

button {
  user-select: none;
}

a {
  text-decoration: none;
}
`

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg1};
  color-scheme: 'light';
}

body {
  min-height: 100vh;
  background-repeat: no-repeat;
}
`
