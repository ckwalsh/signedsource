/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';

import type { SignedContentHashes } from '../../types.ts';
import type { SyncHasherCtor } from './common.ts';
import * as nodeImpl from './index.node.ts';

const inputA = '0889777cb804e138e89cf6459dd58f49';
const inputB = 'd72875573cecb655e41201ea99335d8e';

const expected: SignedContentHashes = {
  md5: '123d369179220d1189f5a68fa3c8dacb',
  sha256: 'cbffe23bf383e474fb9e5f4a38a11720cd4ee855a2178f64e65268abec768b17',
};

interface HasherTestCase {
  label: string;
  Hasher: SyncHasherCtor;
}

const cases: HasherTestCase[] = [
  {
    label: 'node',
    Hasher: nodeImpl.Hasher,
  },
];

describe.each(cases)('$label hasher impl', ({ Hasher }) => {
  test('calculates expected digest', () => {
    const hasher = new Hasher();

    hasher.update(inputA);
    hasher.update(inputB);

    const digest = hasher.syncDigest();

    expect(digest).toStrictEqual(expected);
  });
});
