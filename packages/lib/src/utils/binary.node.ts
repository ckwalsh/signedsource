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
  return Buffer.from(hexString, 'hex').toString('base64url');
}
