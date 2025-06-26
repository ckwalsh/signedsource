/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';
import type { JWK } from 'jose';

import * as neutralImpl from './index.neutral.ts';
import * as nodeImpl from './index.node.ts';

const input: JWK = {
  kty: 'EC',
  d: 'foo',
};
const expectedPublicJWK: JWK = {
  kty: 'EC',
};

interface TestCase {
  label: string;
  isJWK: typeof neutralImpl.isJWK;
  getPublicJWK: typeof neutralImpl.getPublicJWK;
}

const cases: TestCase[] = [
  {
    label: 'neutral',
    isJWK: neutralImpl.isJWK,
    getPublicJWK: neutralImpl.getPublicJWK,
  },
  {
    label: 'node',
    isJWK: nodeImpl.isJWK,
    getPublicJWK: nodeImpl.getPublicJWK,
  },
];

describe.each(cases)('$label key utils', ({ isJWK, getPublicJWK }) => {
  test('isJWK', () => {
    expect(isJWK(input)).toBe(true);
  });

  test('getPublicJWK', () => {
    expect(getPublicJWK(input)).toStrictEqual(expectedPublicJWK);
  });
});
