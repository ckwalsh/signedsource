/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from 'vitest';
import { GENERATED_TOKEN } from '../lib/strings';
import { TokenNotFoundError } from '../lib/errors';
import signCode from '../lib/sign';

test('Simple', () => {
  const unsigned = GENERATED_TOKEN;
  const expected = '@generated SignedSource<<7bbaa67dfb93befa4e06b727b3baed38>>';

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Content Before and After', () => {
  const unsigned = `BEFORE

/* ${GENERATED_TOKEN} */

AFTER`;
  const expected = `BEFORE

/* @generated SignedSource<<20a1a7577cbbfd0d4d402ff0452671ca>> */

AFTER`;

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Double Token', () => {
  const unsigned = `${GENERATED_TOKEN}
${GENERATED_TOKEN}`;
  const expected = `@generated SignedSource<<588e600610182f11d65469c58459b957>>
@generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>>`;

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Tag Only', () => {
  const unsigned = '@generated';

  const signed = () => signCode(unsigned);
  expect(signed).toThrow(TokenNotFoundError);
});
