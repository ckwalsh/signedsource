/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';
import fs from 'node:fs';

import { SourceType } from '../../src/index.ts';
import type { InvalidGeneratedFile } from '../utils/files.ts';
import { getInputFiles } from '../utils/files.ts';
import { getSourceAnalyzers, getSourceSigners } from '../utils/signer.ts';

const [files, signers, analyzers] = await Promise.all([
  getInputFiles(),
  getSourceSigners(),
  getSourceAnalyzers(),
]);

const invalidFiles: InvalidGeneratedFile[] = files.filter(
  (file): file is InvalidGeneratedFile =>
    file.sourceType !== SourceType.MANUAL && !file.isWellFormed,
);

describe.each(invalidFiles)('invalid file $name', ({ absPath }) => {
  const source = fs.readFileSync(absPath, 'utf8');

  test.each(signers)('cannot be signed by $name', async ({ signer }) => {
    await expect(signer.sign(source)).rejects.toThrowErrorMatchingSnapshot();
  });

  test.each(signers)('cannot be unsigned by $name', async ({ signer }) => {
    await expect(signer.unsign(source)).rejects.toThrowErrorMatchingSnapshot();
  });

  test.each(analyzers)('can be analyzed by $name', async ({ analyzer }) => {
    await expect(
      analyzer.analyze(source),
    ).rejects.toThrowErrorMatchingSnapshot();

    await expect(
      analyzer.isGenerated(source),
    ).rejects.toThrowErrorMatchingSnapshot();

    await expect(
      analyzer.isSigned(source),
    ).rejects.toThrowErrorMatchingSnapshot();

    await expect(
      analyzer.isValid(source),
    ).rejects.toThrowErrorMatchingSnapshot();

    await expect(
      analyzer.assertIsValid(source),
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
