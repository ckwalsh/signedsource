/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from 'vitest';
import {
  BEGIN_MANUAL_SECTION_TOKEN,
  END_MANUAL_SECTION_TOKEN,
  GENERATED_TOKEN,
  PARTIALLY_GENERATED_TOKEN,
} from './strings';
import { GeneratedTagNotFoundError, TokenNotFoundError } from './errors';
import signCode from './sign';

test('Generated', () => {
  const unsigned = GENERATED_TOKEN;
  const expected = '@generated SignedSource<<7bbaa67dfb93befa4e06b727b3baed38>>';

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Generated with text before and after', () => {
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

test('Generated double', () => {
  const unsigned = `${GENERATED_TOKEN}
${GENERATED_TOKEN}`;
  const expected = `@generated SignedSource<<588e600610182f11d65469c58459b957>>
@generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>>`;

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Generated tag only', () => {
  const unsigned = '@generated';

  const signed = () => signCode(unsigned);
  expect(signed).toThrow(TokenNotFoundError);
});

test('Partial', () => {
  const unsigned = PARTIALLY_GENERATED_TOKEN;
  const expected = '@partially-generated SignedSource<<a9a9fd53b3d1bb23c7dfeb7244d8a044>>';

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Partial with text before and after', () => {
  const unsigned = `BEFORE

/* ${PARTIALLY_GENERATED_TOKEN} */

AFTER`;
  const expected = `BEFORE

/* @partially-generated SignedSource<<5e8a8b0c49df1daae3190db73acf699b>> */

AFTER`;

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Partial with sections', () => {
  const unsignedCodegen = (c: string) => `/* ${PARTIALLY_GENERATED_TOKEN} */
This is generated code
/* ${BEGIN_MANUAL_SECTION_TOKEN} header */
${c}
/* ${END_MANUAL_SECTION_TOKEN} */
This is generated code code
/* ${BEGIN_MANUAL_SECTION_TOKEN} footer */
${c}
/* ${END_MANUAL_SECTION_TOKEN} */`;

  const expectedCodegen = (c: string) => `/* @partially-generated SignedSource<<af8cc902224b0c424cd412ef4e35bc60>> */
This is generated code
/* BEGIN MANUAL SECTION header */
${c}
/* END MANUAL SECTION */
This is generated code code
/* BEGIN MANUAL SECTION footer */
${c}
/* END MANUAL SECTION */`;

  const manualCode = ['Manual Code', 'Different Manual Code'];

  for (let i = 0; i < manualCode.length; i++) {
    const manual = manualCode[i];
    const unsigned = unsignedCodegen(manual);
    const expected = expectedCodegen(manual);

    let signed = signCode(unsigned);
    expect(signed).toBe(expected);

    signed = signCode(signed);
    expect(signed).toBe(expected);
  }
});

test('Partial double', () => {
  const unsigned = `${PARTIALLY_GENERATED_TOKEN}
${PARTIALLY_GENERATED_TOKEN}`;
  const expected = `@partially-generated SignedSource<<b0e496722327d45da4b4c888438267dc>>
@partially-generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>>`;

  let signed = signCode(unsigned);
  expect(signed).toBe(expected);

  signed = signCode(signed);
  expect(signed).toBe(expected);
});

test('Partial tag only', () => {
  const unsigned = '@partially-generated';

  const signed = () => signCode(unsigned);
  expect(signed).toThrow(TokenNotFoundError);
});

test('Token only', () => {
  const unsigned = '<<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>>';

  const signed = () => signCode(unsigned);
  expect(signed).toThrow(GeneratedTagNotFoundError);
});
