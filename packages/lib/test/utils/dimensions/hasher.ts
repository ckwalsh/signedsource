/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Hasher as NeutralHasher } from '../../../src/utils/hasher/index.neutral.ts';
import { Hasher as NodeHasher } from '../../../src/utils/hasher/index.node.ts';
import type { HasherIf } from '../../../src/utils/hasher/index.node.ts';

interface HasherTestCase {
  label: string;
  hasherFn: () => HasherIf;
}

export const HASHER_TEST_CASES: HasherTestCase[] = [
  {
    label: 'neutral',
    hasherFn: () => new NeutralHasher(),
  },
  {
    label: 'nodejs',
    hasherFn: () => new NodeHasher(),
  },
];
