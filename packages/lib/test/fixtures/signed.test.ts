/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';
import fs from 'node:fs';

import { SourceType } from '../../src/index.ts';
import type { SignedGeneratedFile } from '../utils/files.ts';
import { getInputFiles } from '../utils/files.ts';
import { getSourceAnalyzers } from '../utils/signer.ts';

const [files, analyzers] = await Promise.all([
  getInputFiles(),
  getSourceAnalyzers(),
]);

const signedFiles: SignedGeneratedFile[] = files.filter(
  (file): file is SignedGeneratedFile =>
    file.sourceType !== SourceType.MANUAL && file.isWellFormed && file.isSigned,
);

describe.each(signedFiles)('signed file $name', ({ absPath }) => {
  const source = fs.readFileSync(absPath, 'utf8');

  test('can be verified by at least one analyzer', async () => {
    let foundValid = false;

    await Promise.all(
      analyzers.map(async ({ name, analyzer }) => {
        const isValid = await analyzer.isValid(source);
        if (isValid) {
          await expect(analyzer.assertIsValid(source)).resolves.toBeUndefined();

          foundValid = true;
        } else {
          await expect(
            analyzer.assertIsValid(source),
          ).rejects.toThrowErrorMatchingSnapshot(name);
        }
      }),
    );

    expect(foundValid).toEqual(true);
  });
});
