/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from 'eslint/config';
import globals from 'globals';
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import licenseHeaderPlugin from 'eslint-plugin-license-header';
import signedSource from '@ckwalsh/signedsource-eslint-plugin';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { files: ['**/*.ts'] },
  { ignores: ['**/dist/', 'eslint.config.js'] },
  {
    languageOptions: { globals: globals.node },
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  tseslint.configs.stylisticTypeChecked,
  {
    ignores: ['**/*generated*', 'packages/examples/src/**/*.ts'],
    plugins: {
      'license-header': licenseHeaderPlugin,
    },
    rules: {
      'license-header/header': [
        'error',
        [
          '/*',
          ' * Copyright (c) Cullen Walsh',
          ' *',
          ' * This source code is licensed under the MIT license found in the',
          ' * LICENSE file in the root directory of this source tree.',
          ' */',
        ],
      ],
    },
  },
  {
    rules: {
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
    },
  },
  {
    plugins: {
      signedsource: signedSource,
    },
    rules: {
      'signedsource/valid-signature': 'error',
    },
  },
  eslintPluginPrettierRecommended,
]);
