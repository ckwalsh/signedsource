/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';
import fs from 'node:fs';

import { SourceType } from '../../src/index.ts';
import type { ManualFile } from '../utils/files.ts';
import { getInputFiles } from '../utils/files.ts';
import { getSourceAnalyzers, getSourceSigners } from '../utils/signer.ts';

const [files, signers, analyzers] = await Promise.all([
  getInputFiles(),
  getSourceSigners(),
  getSourceAnalyzers(),
]);

const manualFiles: ManualFile[] = files.filter(
  (file): file is ManualFile => file.sourceType === SourceType.MANUAL,
);

describe.each(manualFiles)('manual file $name', ({ absPath }) => {
  const source = fs.readFileSync(absPath, 'utf8');

  test.each(signers)('cannot be signed by $name', async ({ signer }) => {
    await expect(signer.sign(source)).rejects.toThrowErrorMatchingSnapshot();
  });

  test.each(signers)('cannot be unsigned by $name', async ({ signer }) => {
    await expect(signer.unsign(source)).rejects.toThrowErrorMatchingSnapshot();
  });

  test.each(analyzers)('can be analyzed by $name', async ({ analyzer }) => {
    const analysis = await analyzer.analyze(source);
    expect(analysis).toMatchSnapshot();

    expect(analysis.sourceType).toEqual(SourceType.MANUAL);

    expect(await analyzer.isGenerated(source)).toEqual(false);
    expect(await analyzer.isSigned(source)).toEqual(false);
    expect(await analyzer.isValid(source)).toEqual(false);

    await expect(
      analyzer.assertIsValid(source),
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
