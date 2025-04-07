/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe } from '@jest/globals';
import * as fullUtil from '../../full/tests/util.js';
import * as api from '../index.js';

describe('Full Tests', () => {
  fullUtil.defineTests(api);
});
