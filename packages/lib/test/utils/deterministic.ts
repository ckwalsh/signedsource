/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const JWS_SIG_REGEX = /SignedSource<<[^.>]*\.([^.>]*)>>/g;
const NON_DETERMINISTIC_STUB = 'NonDeterministicSignature';

export function stubNonDeterministicSignature(
  source: string,
  deterministic: boolean,
): string {
  if (deterministic) {
    return source;
  }

  let m = JWS_SIG_REGEX.exec(source);

  while (m !== null) {
    const sig: string = m[1] ?? '';
    const len: number = sig.length;
    const stub = NON_DETERMINISTIC_STUB.repeat(
      Math.ceil(len / NON_DETERMINISTIC_STUB.length),
    ).slice(0, len);
    source = source.replace(sig, stub);
    m = JWS_SIG_REGEX.exec(source);
  }

  return source;
}
