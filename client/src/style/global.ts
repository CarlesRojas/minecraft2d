import { globalCss } from './stitches.config';

const globalStyles = globalCss({
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
    overscrollBehavior: 'touch',
    overflow: 'hidden',
    cursor: 'none',
  },

  html: {
    position: 'relative',
    height: '100%',
    width: '100%',
    fontSize: '$main',
    overflow: 'hidden',
  },

  body: {
    userSelect: 'none',
    position: 'relative',
    height: '100%',
    width: '100%',
    backgroundColor: '$background',
    color: '$text',
    fontFamily: '$main',
    fontSize: '$main',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
    overflow: 'hidden',
  },

  '#root': {
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },

  'img, video, svg': {
    display: 'block',
  },

  a: {
    color: 'inherit',
    textDecoration: 'none',
  },

  ':-webkit-autofill, :-webkit-autofill:hover, :-webkit-autofill:focus': {
    transition: 'background-color 10000s',
    width: 'inherit',
    boxSizing: 'border-box',
    border: '0px solid rgba(255, 255, 255, 0)',
    borderRadius: '1000px',
    padding: 0,
    fontSize: '1rem',
    '-webkit-text-fill-color': '$text',
  },

  button: {
    background: 'none',
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    outline: 'inherit',
  },

  ul: {
    listStyleType: 'none',
  },

  ':focus': {
    outline: 'none',
  },

  '::-moz-focus-inner': {
    border: 0,
  },

  input: {
    border: 'none',
  },

  'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button': {
    margin: 0,
    '-webkit-appearance': 'none',
    appearance: 'none',
  },

  "input[type='number']": {
    '-moz-appearance': 'textfield',
    appearance: 'textfield',
  },

  '::-webkit-scrollbar': {
    height: 0,
    width: 0,
  },

  '::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },

  '::-webkit-scrollbar-thumb': {
    background: '#888',
  },

  '::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
});

export default globalStyles;
