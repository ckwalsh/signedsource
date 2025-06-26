/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import type {
  LabeledFixtureTestCase,
  ResolvedFixtureTestCase,
} from './case.ts';

const SNAPSHOT_DIR_NAME = '__snapshots__';

export function getFixtureTestCases(
  testUrl: string,
  fixtures: Record<string, LabeledFixtureTestCase>,
  ignoreFiles: readonly string[] = [],
): ResolvedFixtureTestCase[] {
  const testPath = url.fileURLToPath(testUrl);

  const rootDir = path.dirname(testPath);

  const files = new Set<string>(getFixtureFilesRecursive(rootDir));

  files.delete(testPath);

  for (const ignoreFile of ignoreFiles) {
    const absIgnoreFile = path.resolve(rootDir, ignoreFile);
    if (!files.delete(absIgnoreFile)) {
      throw new Error(`Ignored file ${ignoreFile} not found in ${rootDir}`);
    }
  }

  const cases: ResolvedFixtureTestCase[] = [];

  for (const [name, fixture] of Object.entries(fixtures)) {
    const absPath = path.resolve(rootDir, name);
    if (!files.delete(absPath)) {
      throw new Error(`Fixture file ${name} not found in ${rootDir}`);
    }

    cases.push({ ...fixture, absPath });
  }

  if (files.size > 0) {
    throw new Error(
      `Found unexpected files in ${rootDir}: ${Array.from(files).join(', ')}`,
    );
  }

  return cases;
}

function getFixtureFilesRecursive(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files: string[] = [];
  const unflattenedFiles: string[][] = [files];

  for (const entry of entries) {
    if (entry.isFile()) {
      files.push(path.resolve(dir, entry.name));
      continue;
    }

    if (entry.name === SNAPSHOT_DIR_NAME) {
      // Skip snapshot directories
      continue;
    }

    unflattenedFiles.push(
      getFixtureFilesRecursive(path.resolve(dir, entry.name)),
    );
  }

  return unflattenedFiles.flat();
}
