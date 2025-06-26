/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function hexToBase64Url(hexString: string): string {
  return Buffer.from(hexString, 'hex').toString('base64url');
}

export function hexToUint8Array(hexString: string): Uint8Array {
  return Uint8Array.from(Buffer.from(hexString, 'hex'));
}
