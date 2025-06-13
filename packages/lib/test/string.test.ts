/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from '@jest/globals';

import type { SourceAnalysis } from '../src/index.ts';
import {
  SourceType,
  StringSourceAnalyzer,
  StringSourceSigner,
} from '../src/index.ts';

const inputSource = `
/* eslint-disable */

/* @generated <<SignedSource::unsigned>> */

const foo = 'bar';
`;

const expectedAnalysis: SourceAnalysis = {
  sourceType: SourceType.GENERATED,
  embeddedSignature: {
    type: 'SignaturePlaceholderToken',
    paddingLength: 8,
    start: 37,
    end: 63,
  },
  contentHashes: {
    md5: '59900c7a639b21a3f5c69eade4632fa9',
    sha256: 'd7997f9963bb25718cadb8b05adc56af434dc549113170ed17f5ccdfdec8ced7',
  },
};

const expectedSigned = `
/* eslint-disable */

/* @generated SignedSource<<59900c7a639b21a3f5c69eade4632fa9>> */

const foo = 'bar';
`;
const expectedUnsigned = `
/* eslint-disable */

/* @generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>> */

const foo = 'bar';
`;

test('analyze', async () => {
  const ss = new StringSourceAnalyzer();

  const analysis = await ss.analyze(inputSource);
  expect(analysis).toEqual(expectedAnalysis);
});

test('sign', async () => {
  const ss = new StringSourceSigner();

  const output = await ss.sign(inputSource);
  expect(output).toEqual(expectedSigned);
});

test('unsign', async () => {
  const ss = new StringSourceSigner();

  const output = await ss.unsign(inputSource);
  expect(output).toEqual(expectedUnsigned);
});
