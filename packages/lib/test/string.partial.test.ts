/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from '@jest/globals';

import type { SourceAnalysis } from '../src/index.ts';
import { StringSourceAnalyzer, StringSourceSigner } from '../src/index.ts';

const inputSource = `
/* eslint-disable */

/* BEGIN MANUAL SECTION pets */
const favoritePet = 'cats';
/* END MANUAL SECTION */

/* @partially-generated <<SignedSource::unsigned>> */

const foo = 'bar';
`;

const expectedAnalysis: SourceAnalysis = {
  sourceType: 'partially-generated',
  embeddedSignature: {
    type: 'SignaturePlaceholderToken',
    paddingLength: 8,
    start: 133,
    end: 159,
  },
  contentHashes: {
    md5: '9e419a7a6c576dc2ab078d67e66f558c',
    sha256: 'a645f552046d99cfff180ea90688f71ef31c04eb6f7467bf0ff3eba063b1cd78',
  },
  manualSections: {
    pets: ` */
const favoritePet = 'cats';
/* `,
  },
};

const manualSectionOverrides = {
  pets: ` */
const favoritePet = 'kittens';
/* `,
};

const expectedSigned = `
/* eslint-disable */

/* BEGIN MANUAL SECTION pets */
const favoritePet = 'kittens';
/* END MANUAL SECTION */

/* @partially-generated SignedSource<<9e419a7a6c576dc2ab078d67e66f558c>> */

const foo = 'bar';
`;
const expectedUnsigned = `
/* eslint-disable */

/* BEGIN MANUAL SECTION pets */
const favoritePet = 'kittens';
/* END MANUAL SECTION */

/* @partially-generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>> */

const foo = 'bar';
`;

test('analyze', async () => {
  const ss = new StringSourceAnalyzer();

  const analysis = await ss.analyze(inputSource);
  expect(analysis).toEqual(expectedAnalysis);
});

test('sign', async () => {
  const ss = new StringSourceSigner();

  const output = await ss.sign(inputSource, { manualSectionOverrides });
  expect(output).toEqual(expectedSigned);
});

test('unsign', async () => {
  const ss = new StringSourceSigner();

  const output = await ss.unsign(inputSource, { manualSectionOverrides });
  expect(output).toEqual(expectedUnsigned);
});
