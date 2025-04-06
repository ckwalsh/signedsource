/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SignedSourceError } from '../errors.js';

export class MismatchedManualSectionTokensError extends SignedSourceError {
  fieldName: string;

  constructor(fieldName: string) {
    super(`Failed to find ending token for manual section '${fieldName}' in partially generated data`);
    this.fieldName = fieldName;
  }
}
