/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  SignedContentHashes,
  SignedSignatureToken,
} from '../../../types.ts';
import type { SignedContentSignerIf } from '../../api/sign.ts';
import type { SignedContentValidatorIf } from '../../api/validate.ts';
import { MultiplexSignedContentValidator } from './validate.ts';

export interface MultiplexSignedContentSignerOptions {
  signer: SignedContentSignerIf;
  validators: SignedContentValidatorIf[];
}

export class MultiplexSignedContentSigner
  extends MultiplexSignedContentValidator
  implements SignedContentSignerIf
{
  readonly PLACEHOLDER: string;
  #signer: SignedContentSignerIf;

  constructor(options: MultiplexSignedContentSignerOptions) {
    const validators = options.validators;

    if (!validators.includes(options.signer)) {
      validators.push(options.signer);
    }

    super({ validators });

    this.PLACEHOLDER = options.signer.PLACEHOLDER;
    this.#signer = options.signer;
  }

  sign(hashes: SignedContentHashes): Promise<SignedSignatureToken> {
    return this.#signer.sign(hashes);
  }
}
