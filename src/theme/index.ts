import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Open Sans', system-ui, sans-serif" },
        body: { value: "'Open Sans', system-ui, sans-serif" },
      },
    },
  },
  globalCss: {
    'html, body': {
      fontFamily: "'Open Sans', system-ui, sans-serif",
    },
  },
});

export const system = createSystem(defaultConfig, config);
