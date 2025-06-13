/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, test } from '@jest/globals';
import fs from 'node:fs';

import type { SourceAnalysis } from '../../src/index.ts';
import { SourceType } from '../../src/index.ts';
import { stubNonDeterministicSignature } from '../utils/deterministic.ts';
import type { ValidGeneratedFile } from '../utils/files.ts';
import { getInputFiles } from '../utils/files.ts';
import { getSourceAnalyzers, getSourceSigners } from '../utils/signer.ts';

const [files, signers, analyzers] = await Promise.all([
  getInputFiles(),
  getSourceSigners(),
  getSourceAnalyzers(),
]);

const generatedFiles: ValidGeneratedFile[] = files.filter(
  (file): file is ValidGeneratedFile =>
    file.sourceType !== SourceType.MANUAL && file.isWellFormed,
);

describe.each(generatedFiles)(
  'generated file $name',
  ({ absPath, sourceType, isSigned }) => {
    const source = fs.readFileSync(absPath, 'utf8');

    const wrongSourceType =
      sourceType === SourceType.GENERATED
        ? SourceType.PARTIALLY_GENERATED
        : SourceType.GENERATED;

    test.each(signers)(
      'can be signed by $name',
      async ({ signer, analyzers, deterministic }) => {
        const result = await signer.sign(source, { sourceType });
        const stubbedResult = stubNonDeterministicSignature(
          result,
          deterministic,
        );

        expect(stubbedResult).toMatchSnapshot('signed');

        expect(
          stubNonDeterministicSignature(
            await signer.sign(source),
            deterministic,
          ),
        ).toEqual(stubbedResult);

        await expect(
          signer.sign(source, { sourceType: wrongSourceType }),
        ).rejects.toThrowErrorMatchingSnapshot('wrongSourceType');

        let first: SourceAnalysis | null = null;

        for (const analyzer of [signer, ...analyzers]) {
          const analysis = await signer.analyze(stubbedResult, {
            sourceType,
          });
          expect(analysis).toMatchSnapshot('analysis');
          expect(analysis.sourceType).toEqual(sourceType);

          if (first === null) {
            first = analysis;
          } else {
            expect(analysis).toEqual(first);
          }

          const analysisAutoDetected = await signer.analyze(stubbedResult);
          expect(analysisAutoDetected).toEqual(analysis);

          expect(await analyzer.isGenerated(result)).toEqual(true);
          expect(await analyzer.isSigned(result)).toEqual(true);

          await analyzer.assertIsValid(result);
          expect(await analyzer.isValid(result)).toEqual(true);
        }
      },
    );

    test.each(signers)(
      'can be unsigned by $name',
      async ({ signer, analyzers }) => {
        const result = await signer.unsign(source, { sourceType });

        expect(result).toMatchSnapshot('signed');

        await expect(
          signer.sign(source, { sourceType: wrongSourceType }),
        ).rejects.toThrowErrorMatchingSnapshot('wrongSourceType');

        let first: SourceAnalysis | null = null;

        for (const analyzer of [signer, ...analyzers]) {
          const analysis = await signer.analyze(result, {
            sourceType,
          });
          expect(analysis).toMatchSnapshot('analysis');
          expect(analysis.sourceType).toEqual(sourceType);

          if (first === null) {
            first = analysis;
          } else {
            expect(analysis).toEqual(first);
          }

          const analysisAutoDetected = await signer.analyze(result);
          expect(analysisAutoDetected).toEqual(analysis);

          expect(await analyzer.isGenerated(result)).toEqual(true);
          expect(await analyzer.isSigned(result)).toEqual(false);

          await expect(
            analyzer.assertIsValid(result),
          ).rejects.toThrowErrorMatchingSnapshot();
          expect(await analyzer.isValid(result)).toEqual(false);
        }
      },
    );

    test.each(analyzers)('can be analyzed by $name', async ({ analyzer }) => {
      const analysis = await analyzer.analyze(source);
      expect(analysis).toMatchSnapshot('analysis');
      expect(analysis.sourceType).toEqual(sourceType);

      expect(await analyzer.isGenerated(source)).toEqual(true);
      expect(await analyzer.isSigned(source)).toEqual(isSigned);
    });
  },
);
