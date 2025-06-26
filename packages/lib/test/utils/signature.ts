/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const REGEX = /SignedSource<<([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)>>/;
const STUB = 'Stubbed';

export function stubNonDeterministicSignature(signedSource: string): string {
  const match = REGEX.exec(signedSource);

  if (match === null) {
    return signedSource;
  }

  const originalToken = match[0];
  const header = match[1] ?? '';
  const originalSig = match[2] ?? '';

  const replacementSig = STUB.repeat(
    Math.ceil(originalSig.length / STUB.length),
  ).slice(0, originalSig.length);

  const replacementToken = `SignedSource<<${header}.${replacementSig}>>`;

  return signedSource.replace(originalToken, replacementToken);
}
