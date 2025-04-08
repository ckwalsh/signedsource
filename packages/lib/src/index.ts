/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export * from './auto/index.js';
export { GENERATED_TAG, GENERATED_TOKEN } from './full/constants.js';
export {
  GENERATED_TAG as PARTIALLY_GENERATED_TAG,
  GENERATED_TOKEN as PARTIALLY_GENERATED_TOKEN,
  BEGIN_MANUAL_SECTION_TOKEN,
  END_MANUAL_SECTION_TOKEN,
} from './partial/constants.js';
export { MismatchedManualSectionTokensError } from './partial/errors.js';
