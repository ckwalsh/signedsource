/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from '@jest/globals';

import type { SignedContentHashes } from '../types/impl/analyzer.ts';
import * as defaultImpl from './hasher.default.ts';
import * as nodeImpl from './hasher.node.ts';

const inputA = '0889777cb804e138e89cf6459dd58f49';
const inputB = 'd72875573cecb655e41201ea99335d8e';

const expected: SignedContentHashes = {
  md5: '123d369179220d1189f5a68fa3c8dacb',
  sha256: 'cbffe23bf383e474fb9e5f4a38a11720cd4ee855a2178f64e65268abec768b17',
};

test('basic', async () => {
  const defaultHasher = new defaultImpl.Hasher();
  const nodeHasher = new nodeImpl.Hasher();

  defaultHasher.update(inputA);
  nodeHasher.update(inputA);
  defaultHasher.update(inputB);
  nodeHasher.update(inputB);

  const defaultResult = await defaultHasher.digest();
  const nodeResult = await nodeHasher.digest();

  expect(defaultResult).toStrictEqual(expected);
  expect(nodeResult).toStrictEqual(expected);
});
