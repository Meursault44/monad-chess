// src/theme.ts
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Open Sans', system-ui, sans-serif" },
        body: { value: "'Open Sans', system-ui, sans-serif" },
      },
      colors: {
        appBg: { value: '#0e100f' },

        cardBg: { value: '#1a1b1f' },
        cardHoverBg: { value: '#202229' },
        cardBorder: { value: 'rgba(255,255,255,0.08)' },

        cardHeaderBg: { value: '#14161a' }, // если нужен отличающийся хедер
        tableBorderSoft: { value: 'rgba(255,255,255,0.12)' },
        tableRowHover: { value: 'rgba(255,255,255,0.04)' },

        textMain: { value: '#ffffff' },
        textMuted: { value: 'rgba(255,255,255,0.72)' },

        scrollbarThumb: { value: 'rgba(255,255,255,0.28)' },
        scrollbarThumbHover: { value: 'rgba(255,255,255,0.42)' },
        scrollbarTrack: { value: 'transparent' },
      },
      radii: {
        card: { value: '12px' },
      },
    },

    slotRecipes: {
      // -------- CARD (единый тёмный фон + обрезка углов) --------
      card: {
        className: 'card',
        slots: ['root', 'header', 'body', 'footer'],
        base: {
          root: {
            color: '{colors.textMain}',
            rounded: '{radii.card}',
            overflow: 'hidden',
            border: 'none',
            background: '{colors.cardBg} !important',
          },
          // у внутренних слотов фон прозрачный, чтобы не создавать «щели»
          header: { bg: '{colors.cardBg}', color: '{colors.textMain}', px: '4', py: '3' },
          body: { bg: '{colors.cardBg}', color: '{colors.textMain}', px: '4', py: '4' },
          footer: { bg: '{colors.cardBg}', color: '{colors.textMuted}', px: '4', py: '3' },
        },
        variants: {
          hover: {
            subtle: {
              root: { _hover: { bg: '{colors.cardHoverBg}' } },
            },
          },
        },
      },

      // -------- TABLE (тёмные ячейки и мягкие линии) --------
      table: {
        className: 'table',
        slots: ['root', 'header', 'body', 'footer', 'row', 'cell', 'columnHeader', 'caption'],
        base: {
          root: { color: '{colors.textMain}' },
          header: { bg: '{colors.cardHeaderBg}' },
          row: { background: '{colors.cardBg}', _hover: { bg: '{colors.cardHoverBg}' } },
          cell: {
            color: '{colors.textMain}',
            borderColor: '{colors.tableBorderSoft}',
          },
          columnHeader: {
            color: '{colors.textMain}',
            bg: '{colors.cardBg}',
            borderColor: '{colors.tableBorderSoft}',
          },
        },
        variants: {
          variant: {
            line: {
              // ← перенесли сюда
              row: {
                bg: '{colors.cardBg}',
                _hover: { bg: '{colors.cardHoverBg}' },
              },
              cell: { borderBottomWidth: '1px', borderColor: '{colors.tableBorderSoft}' },
              columnHeader: { borderBottomWidth: '1px', borderColor: '{colors.tableBorderSoft}' },
            },
          },
          size: {
            sm: { cell: { py: '2', px: '3' }, columnHeader: { py: '2', px: '3' } },
            md: { cell: { py: '3', px: '4' }, columnHeader: { py: '3', px: '4' } },
          },
        },
        defaultVariants: { variant: 'line', size: 'sm' },
      },

      // -------- STAT --------
      stat: {
        className: 'stat',
        slots: ['root', 'label', 'helpText', 'valueText'],
        base: {
          root: { color: '{colors.textMain}' },
          label: { color: '{colors.textMuted}' },
          helpText: { color: '{colors.textMuted}' },
          valueText: { color: '{colors.textMain}' },
        },
      },
    },
  },

  globalCss: {
    'html, body': {
      fontFamily: "'Open Sans', system-ui, sans-serif",
      backgroundColor: '{colors.appBg}',
    },
    /* === Firefox === */
    '*, *::before, *::after': {
      scrollbarWidth: 'thin',
      scrollbarColor: '{colors.scrollbarThumb} {colors.scrollbarTrack}',
    },

    /* === WebKit (Chrome/Edge/Safari) === */
    '::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: '{colors.scrollbarThumb}',
      borderRadius: '8px',
      border: '2px solid transparent', // даёт «пэддинг» внутри
      backgroundClip: 'content-box', // убирает «залипание» к краям
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '{colors.scrollbarThumbHover}',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: '{colors.scrollbarTrack}',
    },
    '::-webkit-scrollbar-corner': {
      background: 'transparent',
    },
  },
});

export const system = createSystem(defaultConfig, config);
