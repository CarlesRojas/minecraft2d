import { createStitches } from '@stitches/react';

export const { styled, css, globalCss, getCssText } = createStitches({
  theme: {
    colors: {
      background: '#1e212c',
      text: 'white',
      primaryColor: '#00aaff',
    },
    fontSizes: {
      main: '16px',
    },
    fonts: {
      main: 'Montserrat, sans-serif',
    },
  },
});
