/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GENERATED_TAG, PARTIALLY_GENERATED_TAG } from './strings';

export class SignedSourceError extends Error {}

export class GeneratedTagNotFoundError extends SignedSourceError {
  constructor() {
    super(`Could not find ${GENERATED_TAG} or ${PARTIALLY_GENERATED_TAG} in the data`);
  }
}

export class UnsignedDataError extends SignedSourceError {
  constructor() {
    super('Attempted to verify unsigned data');
  }
}

export class SignedSourceParseError extends SignedSourceError {}

export class TokenNotFoundError extends SignedSourceParseError {
  constructor(token: string) {
    super(`Could not find SignedSource token '${token}' in generated data`);
  }
}

export class MismatchedManualSectionTokensError extends SignedSourceParseError {
  constructor(fieldName: string) {
    super(`Failed to find ending token for manual section '${fieldName}' in partially generated data`);
  }
}
