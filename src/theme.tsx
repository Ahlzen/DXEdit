import { createTheme, Stack, Title } from '@mantine/core';

// Mantine theme
export const theme = createTheme({
  focusRing: 'always',
  scale: 1.0,
  fontSmoothing: true,
  defaultRadius: 'sm',
  cursorType: 'pointer',
  spacing: {
    // reduce spacing a bit compared to default
    xs: '0.2rem',
    sm: '0.5rem',
    md: '0.7rem',
    lg: '1.5rem',
    xl: '2.5rem'
  },
  components: {
    Stack: Stack.extend({
      defaultProps: {
        gap: 'xs'
      }
    }),
    Title: Title.extend({
      defaultProps: {
        mt: 'lg'
      }
    }),
  },
  headings: {
    sizes: {
      h1: { fontSize: '2rem' },
      h2: { fontSize: '1.3rem' },
      h3: { fontSize: '1rem' },
    }
  },
});