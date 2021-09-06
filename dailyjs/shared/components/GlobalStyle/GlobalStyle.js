import React from 'react';
import theme from '../../styles/defaultTheme';
import { hexa } from '../../styles/global';

export const GlobalStyle = () => (
  <style jsx global>{`
    :root {
      --background: ${theme.background};
      --reverse: ${theme.reverse};

      --primary-default: ${theme.primary.default};
      --primary-dark: ${theme.primary.dark};
      --secondary-default: ${theme.secondary.default};
      --secondary-dark: ${theme.secondary.dark};
      --secondary-light: ${theme.secondary.light};
      --blue-light: ${theme.blue.light};
      --blue-default: ${theme.blue.default};
      --blue-dark: ${theme.blue.dark};
      --green-light: ${theme.green.light};
      --green-default: ${theme.green.default};
      --green-dark: ${theme.green.dark};
      --red-light: ${theme.red.light};
      --red-default: ${theme.red.default};
      --red-dark: ${theme.red.dark};
      --gray-wash: ${theme.gray.wash};
      --gray-light: ${theme.gray.light};
      --gray-default: ${theme.gray.default};
      --gray-dark: ${theme.gray.dark};

      --text-default: ${theme.text.default};
      --text-reverse: ${theme.text.reverse};
      --text-mid: ${theme.text.mid};
      --text-darkest: ${theme.text.darkest};
      --text-pre: ${theme.text.pre};

      --font-family: 'Rubik', sans-serif;
      --weight-regular: 400;
      --weight-medium: 500;
      --weight-bold: 600;

      --radius-xs: 6px;
      --radius-sm: 9px;
      --radius-md: 12px;

      --spacing-xxxxl: 5.25rem;
      --spacing-xxxl: 4.5rem;
      --spacing-xxl: 3.75rem;
      --spacing-xl: 3rem;
      --spacing-lg: 2.25rem;
      --spacing-md: 1.875rem;
      --spacing-sm: 1.5rem;
      --spacing-xs: 1.125rem;
      --spacing-xxs: 0.75rem;
      --spacing-xxxs: 0.5625rem;
      --spacing-xxxxs: 0.375rem;

      --shadow-depth-1: 0px 5px 25px rgba(0, 0, 0, 0.07);
      --shadow-depth-2: 0px 5px 15px rgba(0, 0, 0, 0.07);
    }

    html {
      background: var(--background);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font: normal normal normal 1rem / 1.6 var(--font-family);
      font-size: 1rem;
    }

    body {
      color: var(--text-default);
      background: var(--background);
      margin: 0px;
      font-size: 1rem;
    }

    *,
    ::before,
    ::after {
      box-sizing: border-box;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: var(--spacing-md) 0;
      font-weight: var(--weight-bold);
      line-height: 1.2;
    }

    a {
      transition: color 250ms;
    }

    a,
    a:active,
    a:visited {
      color: var(--text-mid);
    }

    a:hover {
      color: var(--text-darkest);
    }

    p {
      line-height: 1.6;
    }

    hr {
      border: none;
      height: 1px;
      background-color: var(--gray-light);
      margin: var(--spacing-sm) 0;
    }

    code {
      display: inline;
      color: var(--text-pre);
      background-color: ${hexa(theme.text.pre, 0.12)};
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 0.875rem;
    }

    hr {
      border: 0;
      height: 1px;
      background: var(--gray-light);
    }
  `}</style>
);

export default GlobalStyle;
