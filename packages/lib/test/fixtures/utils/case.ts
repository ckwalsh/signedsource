/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SourceType } from '../../../src/index.ts';
import type { SignerDefaultOptionsTestCaseKey } from '../../utils/dimensions/signerOptions.ts';

///////////////////////////////////

interface FixtureTestCase {
  sourceType: SourceType;
  isWellFormed: boolean;
  signedBy?: SignerDefaultOptionsTestCaseKey;
  isValidSignature?: boolean;
  manualSections?: string[];
}

export interface LabeledFixtureTestCase extends FixtureTestCase {
  label: string;
}

export interface ResolvedFixtureTestCase extends LabeledFixtureTestCase {
  absPath: string;
}
