/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @internal
 */
export function hexToBase64Url(hexString: string): string {
  const base64 = btoa(
    String.fromCharCode(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...hexString.match(/../g)!.map((byte) => parseInt(byte, 16)),
    ),
  );

  // Replace characters for base64url
  const base64url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64url;
}
