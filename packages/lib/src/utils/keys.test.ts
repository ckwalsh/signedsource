/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from '@jest/globals';

import * as defaultImpl from './keys.default.ts';
import * as nodeImpl from './keys.node.ts';

const input = {
  kty: 'EC',
};

test('basic', () => {
  expect(defaultImpl.isJWK(input)).toBe(true);
  expect(nodeImpl.isJWK(input)).toBe(true);
});
