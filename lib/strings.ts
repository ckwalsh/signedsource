/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const GENERATED_TAG = '@' + 'generated';
export const PARTIALLY_GENERATED_TAG = '@' + 'partially-generated';
export const TOKEN = '<<SignedSource::*O*zOeWoEQle#+L!plEphiEmie@IsG>>';

export const GENERATED_TOKEN = `${GENERATED_TAG} ${TOKEN}`;
export const PARTIALLY_GENERATED_TOKEN = `${PARTIALLY_GENERATED_TAG} ${TOKEN}`;
export const BEGIN_MANUAL_SECTION_TOKEN = 'BEGIN MANUAL SECTION';
export const END_MANUAL_SECTION_TOKEN = 'END MANUAL SECTION';

export const UNSIGNED_TOKEN_PATTERN = /@(?:partially-)?generated <<SignedSource::\*O\*zOeWoEQle#\+L!plEphiEmie@IsG>>/;
export const SIGNED_TOKEN_PATTERN = /@(?:partially-)?generated (SignedSource<<([0-9a-f]{32})>>)/;
export const BEGIN_MANUAL_SECTION_PATTERN = /BEGIN MANUAL SECTION ([0-9a-zA-Z_-]+)/;
