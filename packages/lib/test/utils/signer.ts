/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  StringSourceAnalyzerIf,
  StringSourceSignerIf,
} from '../../src/index.ts';
import {
  SourceSigner,
  StringSourceAnalyzer,
  StringSourceSigner,
} from '../../src/index.ts';
import { getContentSigners, getContentVerifiers } from './content.ts';

interface InputSourceSigner {
  name: string;
  signer: StringSourceSignerIf;
  analyzers: StringSourceAnalyzerIf[];
  deterministic: boolean;
}

let signersPromise: Promise<InputSourceSigner[]> | null = null;

export function getSourceSigners(): Promise<InputSourceSigner[]> {
  signersPromise ??= (async (): Promise<InputSourceSigner[]> => {
    const contentSigners = await getContentSigners();

    return [
      {
        name: 'SourceSigner (Multitype)',
        signer: new SourceSigner(),
        analyzers: [],
        deterministic: true,
      },
      {
        name: 'StringSourceSigner (Default)',
        signer: new StringSourceSigner(),
        analyzers: [],
        deterministic: true,
      },
      ...contentSigners.map(({ name, signer, verifiers, deterministic }) => ({
        name: `StringSourceSigner (${name})`,
        signer: new StringSourceSigner({ signer }),
        analyzers: verifiers.map(
          (verifier) => new StringSourceAnalyzer({ verifier }),
        ),
        deterministic,
      })),
    ];
  })();

  return signersPromise;
}

interface InputSourceAnalyzer {
  name: string;
  analyzer: StringSourceAnalyzerIf;
}

let analyzersPromise: Promise<InputSourceAnalyzer[]> | null = null;

export function getSourceAnalyzers(): Promise<InputSourceAnalyzer[]> {
  analyzersPromise ??= (async (): Promise<InputSourceAnalyzer[]> => {
    const [contentVerifiers, sourceSigners] = await Promise.all([
      getContentVerifiers(),
      getSourceSigners(),
    ]);

    return [
      {
        name: 'StringSourceAnalyzer (Default)',
        analyzer: new StringSourceAnalyzer(),
      },
      ...contentVerifiers.map(({ name, verifier }) => ({
        name: `StringSourceAnalyzer (${name})`,
        analyzer: new StringSourceAnalyzer({ verifier }),
      })),
      ...sourceSigners.map(({ name, signer }) => ({
        name,
        analyzer: signer,
      })),
    ];
  })();

  return analyzersPromise;
}
