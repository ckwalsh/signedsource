/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from '@jest/globals';

import * as defaultImpl from './binary.default.ts';
import * as nodeImpl from './binary.node.ts';

const input = '0889777cb804e138e89cf6459dd58f49';
const expected = 'CIl3fLgE4TjonPZFndWPSQ';

test('hexToBase64Url', () => {
  expect(defaultImpl.hexToBase64Url(input)).toBe(expected);
  expect(nodeImpl.hexToBase64Url(input)).toBe(expected);
});

test('hexToUint8Array', () => {
  expect(defaultImpl.hexToUint8Array(input)).toStrictEqual(
    nodeImpl.hexToUint8Array(input),
  );
});
