import { fileURLToPath } from 'url';
import { dirname } from 'path';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.app.json']
      }
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn'
    }
  }
];