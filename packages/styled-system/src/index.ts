import { definePreset } from '@pandacss/dev';
import { breakpoints } from './breakpoints';
import { conditions } from './conditions';
import { globalCss, globalFontface, globalVars } from './global';
import { keyframes } from './keyframes';
import { semanticTokens, tokens } from './tokens';
import { utilities, patterns } from './utilities';

export const preset = definePreset({
  name: '@typie/website',

  theme: {
    breakpoints,
    tokens,
    semanticTokens,
    keyframes,
  },

  conditions,
  utilities,
  patterns,

  globalCss,
  globalFontface,
  globalVars,
});
