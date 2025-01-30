/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @format */

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import licenseHeaderPlugin from 'eslint-plugin-license-header';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/*', 'resources/license-header.ts'],
  },
  {
    plugins: {
      'license-header': licenseHeaderPlugin,
    },
    rules: {
      'license-header/header': ['error', './resources/license-header.ts'],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
    },
  },
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintPluginPrettierRecommended,
);
