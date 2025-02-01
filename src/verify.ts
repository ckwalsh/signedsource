/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GeneratedTagNotFoundError, UnsignedDataError } from './errors';
import { hash, parseContent } from './impl';

/**
 * Verifies that the generated code has not been modified since it was signed.
 *
 * @param signedData The signed code to verify the signature of.
 * @returns true if the embedded signature is valid, false otherwise.
 */
export default function verifyCode(signedData: string): boolean {
  const content = parseContent(signedData);
  if (!content.generated) {
    throw new GeneratedTagNotFoundError();
  } else if (content.embeddedSignature === undefined) {
    throw new UnsignedDataError();
  }

  return content.embeddedSignature === hash(content.data);
}
