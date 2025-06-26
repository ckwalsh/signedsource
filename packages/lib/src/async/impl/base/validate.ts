/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  SignedContentValidatorIf,
  SignedSourceValidatorDefaultOptions,
  SignedSourceValidatorIf,
  SignedSourceValidatorOptions,
} from '../../api/validate.ts';
import { DefaultSignedContentValidator } from '../../signatures/index.ts';
import { SignedSourceAnalyzerBase } from './analyze.ts';

export abstract class SignedSourceValidatorBase<TSource>
  extends SignedSourceAnalyzerBase<TSource>
  implements SignedSourceValidatorIf<TSource>
{
  readonly #validator: SignedContentValidatorIf;

  constructor(defaults: Partial<SignedSourceValidatorDefaultOptions> = {}) {
    super(defaults);

    this.#validator = defaults.validator ?? new DefaultSignedContentValidator();
  }

  async isValid(
    source: TSource,
    options: Partial<SignedSourceValidatorOptions> = {},
  ): Promise<boolean> {
    const analysis = await this.analyze(source, options);

    if (analysis.sourceType === 'manual') {
      return false;
    }

    const validator = options.validator ?? this.#validator;

    return await validator.isValid(
      options.signature ?? analysis.embeddedSignature,
      analysis.contentHashes,
    );
  }

  async assertIsValid(
    source: TSource,
    options: Partial<SignedSourceValidatorOptions> = {},
  ): Promise<void> {
    const analysis = await this.analyze(source, options);

    if (analysis.sourceType === 'manual') {
      throw new Error('Source is not generated');
    }

    const validator = options.validator ?? this.#validator;

    await validator.assertIsValid(
      options.signature ?? analysis.embeddedSignature,
      analysis.contentHashes,
    );
  }
}
