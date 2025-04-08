/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { rules } from './rules/index.js';
import pkg from '../package.json' with { type: 'json' };

import type { AnyRuleModule } from '@typescript-eslint/utils/ts-eslint';
import type { ESLint } from 'eslint';

type RuleKey = keyof typeof rules;

interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
  rules: Record<RuleKey, AnyRuleModule>;
}

export const signedSourcePlugin: Plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules,
};

export default signedSourcePlugin;
