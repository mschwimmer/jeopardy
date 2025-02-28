// eslint.config.ts

import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
    // This object specifies the ignore patterns.
    {
      ignores: ['src/__generated__/**', 'src/app/shared-theme/**'],
    },
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'plugin:react-hooks/recommended'],
    settings: {
      next: {
        rootDir: __dirname,
      },
    },
  }),
]

export default eslintConfig

