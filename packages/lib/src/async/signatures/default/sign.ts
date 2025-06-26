/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EmbeddedJwtJwsSignedContentValidator } from '../jws/validate.ts';
import { MD5SignedContentSignerValidator } from '../md5.ts';
import { MultiplexSignedContentSigner } from '../multiplex/sign.ts';

export class DefaultSignedContentSigner extends MultiplexSignedContentSigner {
  constructor() {
    const md5 = new MD5SignedContentSignerValidator();
    const embeddedJwt = new EmbeddedJwtJwsSignedContentValidator();

    super({
      signer: md5,
      validators: [md5, embeddedJwt],
    });
  }
}
