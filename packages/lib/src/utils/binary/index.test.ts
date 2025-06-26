/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';

import * as neutralImpl from './index.neutral.ts';
import * as nodeImpl from './index.node.ts';

const input = '0889777cb804e138e89cf6459dd58f49';
const expectedBase64 = 'CIl3fLgE4TjonPZFndWPSQ';
const expectedUint8Array = new Uint8Array([
  8, 137, 119, 124, 184, 4, 225, 56, 232, 156, 246, 69, 157, 213, 143, 73,
]);

interface TestCase {
  label: string;
  hexToBase64Url: typeof neutralImpl.hexToBase64Url;
  hexToUint8Array: typeof neutralImpl.hexToUint8Array;
}

const cases: TestCase[] = [
  {
    label: 'neutral',
    hexToBase64Url: neutralImpl.hexToBase64Url,
    hexToUint8Array: neutralImpl.hexToUint8Array,
  },
  {
    label: 'node',
    hexToBase64Url: nodeImpl.hexToBase64Url,
    hexToUint8Array: nodeImpl.hexToUint8Array,
  },
];

describe.each(cases)(
  '$label binary utils',
  ({ hexToBase64Url, hexToUint8Array }) => {
    test('hexToBase64Url', () => {
      expect(hexToBase64Url(input)).toBe(expectedBase64);
    });

    test('hexToUint8Array', () => {
      expect(hexToUint8Array(input)).toStrictEqual(expectedUint8Array);
    });
  },
);
