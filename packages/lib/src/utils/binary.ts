/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function hexToBase64Url(hexString: string): string {
  const bytes: number[] =
    hexString.match(/../g)?.map((byte) => parseInt(byte, 16)) ?? [];

  const base64 = btoa(String.fromCharCode(...bytes));

  // Replace characters for base64url
  const base64url = base64
    .replace(/\+/g, '-')
    .replace(/\/+/g, '_')
    .replace(/=+$/, '');

  return base64url;
}

export function hexToUint8Array(hexString: string): Uint8Array {
  const length = hexString.length / 2;
  const uint8Array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    uint8Array[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
  }

  return uint8Array;
}
