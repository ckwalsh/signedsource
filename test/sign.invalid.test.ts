/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from 'vitest';
import { GeneratedTagNotFoundError } from '../lib/errors';
import signCode from '../lib/sign';

test('Token only', () => {
  const unsigned = '<<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>>';

  const signed = () => signCode(unsigned);
  expect(signed).toThrow(GeneratedTagNotFoundError);
});
