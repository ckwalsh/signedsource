#!/usr/bin/env node

/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Builtins, Cli } from 'clipanion';
import * as path from 'node:path';

import pkg from '../package.json' with { type: 'json' };
import {
  AnalyzeCommand,
  SignCommand,
  UnsignCommand,
  VerifyCommand,
} from '../src/index.ts';

const [_node, app, ...args] = process.argv;

if (app === undefined) {
  throw new Error('Missing app name');
}

const cli = new Cli({
  binaryName: path.basename(app),
  binaryVersion: pkg.version,
});

cli.register(Builtins.HelpCommand);
cli.register(AnalyzeCommand);
cli.register(SignCommand);
cli.register(UnsignCommand);
cli.register(VerifyCommand);

void cli.runExit(args);
