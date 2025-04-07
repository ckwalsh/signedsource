/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { UNSIGNED_PLACEHOLDER } from '../constants.js';

export const GENERATED_TAG = '@' + 'partially-generated';
export const GENERATED_TOKEN = `${GENERATED_TAG} ${UNSIGNED_PLACEHOLDER}`;

export const BEGIN_MANUAL_SECTION_TOKEN = 'BEGIN MANUAL SECTION';
export const END_MANUAL_SECTION_TOKEN = 'END MANUAL SECTION';
