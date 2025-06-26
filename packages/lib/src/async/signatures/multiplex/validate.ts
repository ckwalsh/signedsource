/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SignatureToken, SignedContentHashes } from '../../../types.ts';
import type { SignedContentValidatorIf } from '../../api/validate.ts';

export interface MultiplexSignedContentValidatorOptions {
  validators: SignedContentValidatorIf[];
}

export class MultiplexSignedContentValidator
  implements SignedContentValidatorIf
{
  #validators: SignedContentValidatorIf[];

  constructor(options: MultiplexSignedContentValidatorOptions) {
    this.#validators = options.validators;
  }

  async isValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<boolean> {
    for (const validator of this.#validators) {
      if (await validator.isValid(signature, hashes)) {
        return true;
      }
    }

    return false;
  }

  assertIsValid(
    signature: SignatureToken,
    hashes: SignedContentHashes,
  ): Promise<void> {
    return Promise.any(
      this.#validators.map((validator) =>
        validator.assertIsValid(signature, hashes),
      ),
    );
  }
}
