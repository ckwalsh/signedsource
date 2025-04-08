#!/usr/bin/env node

/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Cli } from 'clipanion';
import * as path from 'path';
import pkg from '../package.json' with { type: 'json' };

import { SignCommand, VerifyCommand } from '../src/index.js';

const [_node, app, ...args] = process.argv;

const cli = new Cli({
  binaryName: path.basename(app),
  binaryVersion: pkg.version,
});

cli.register(SignCommand);
cli.register(VerifyCommand);

void cli.runExit(args);
