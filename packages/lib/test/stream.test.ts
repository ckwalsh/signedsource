/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from '@jest/globals';
import type { UnderlyingSink } from 'node:stream/web';

import type { SourceAnalysis } from '../src/index.ts';
import { StreamSourceAnalyzer, StreamSourceSigner } from '../src/index.ts';

const inputSource = `
/* eslint-disable */

/* @generated <<SignedSource::unsigned>> */

const foo = 'bar';
`;

const expectedAnalysis: SourceAnalysis = {
  sourceType: 'generated',
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

class StringConcatSink implements UnderlyingSink<string> {
  public output = '';
  private chunks: string[] = [];

  write(chunk: string): void {
    this.chunks.push(chunk);
  }
  close(): void {
    this.output = this.chunks.join('');
  }
}

test('analyze', async () => {
  const stream = ReadableStream.from(inputSource);
  const ss = new StreamSourceAnalyzer();

  const analysis = await ss.analyze(stream);
  expect(analysis).toEqual(expectedAnalysis);
});

test('sign', async () => {
  const stream = ReadableStream.from(inputSource);
  const ss = new StreamSourceSigner();

  const sink = new StringConcatSink();

  await ss.sign(stream).pipeTo(new WritableStream(sink));
  expect(sink.output).toEqual(expectedSigned);
});

test('unsign', async () => {
  const stream = ReadableStream.from(inputSource);
  const ss = new StreamSourceSigner();

  const sink = new StringConcatSink();

  await ss.unsign(stream).pipeTo(new WritableStream(sink));
  expect(sink.output).toEqual(expectedUnsigned);
});
