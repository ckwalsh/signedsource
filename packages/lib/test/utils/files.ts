/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

import type { SourceType } from '../../src/index.ts';

const modulePath = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(modulePath);

interface InputFileBase {
  name: string;
  absPath: string;
  sourceType: SourceType;
}

export interface ManualFile extends InputFileBase {
  sourceType: 'manual';
}

interface GeneratedFileBase extends InputFileBase {
  sourceType: Exclude<SourceType, 'manual'>;
}

interface UnsignedGeneratedFile extends GeneratedFileBase {
  isWellFormed: true;
  isSigned: false;
}

export interface SignedGeneratedFile extends GeneratedFileBase {
  isWellFormed: true;
  isSigned: true;
  isValidSignature: boolean;
}

export type ValidGeneratedFile = UnsignedGeneratedFile | SignedGeneratedFile;

export interface InvalidGeneratedFile extends GeneratedFileBase {
  isWellFormed: false;
}

type InputFile = ManualFile | ValidGeneratedFile | InvalidGeneratedFile;

const fixtureRoot = path.join(__dirname, '..', 'fixtures');

const manualFiles: ManualFile[] = [
  {
    name: 'manual/foobar.txt',
    absPath: path.join(fixtureRoot, 'manual/foobar.txt'),
    sourceType: 'manual',
  },
];

const unsignedFiles: UnsignedGeneratedFile[] = [
  {
    name: 'unsigned/generated.custom.txt',
    absPath: path.join(fixtureRoot, 'unsigned/generated.custom.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: false,
  },
  {
    name: 'unsigned/generated.txt',
    absPath: path.join(fixtureRoot, 'unsigned/generated.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: false,
  },
  {
    name: 'unsigned/generated.shortpadding.txt',
    absPath: path.join(fixtureRoot, 'unsigned/generated.shortpadding.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: false,
  },
  {
    name: 'unsigned/partial.txt',
    absPath: path.join(fixtureRoot, 'unsigned/partial.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: false,
  },
  {
    name: 'unsigned/partial.early.txt',
    absPath: path.join(fixtureRoot, 'unsigned/partial.early.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: false,
  },
];

const signedFiles: SignedGeneratedFile[] = [
  {
    name: 'signed/legacy/generated.txt',
    absPath: path.join(fixtureRoot, 'signed/legacy/generated.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/legacy/partial.txt',
    absPath: path.join(fixtureRoot, 'signed/legacy/partial.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/legacy/partial.early.txt',
    absPath: path.join(fixtureRoot, 'signed/legacy/partial.early.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/ed25519/generated.txt',
    absPath: path.join(fixtureRoot, 'signed/ed25519/generated.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/ed25519/generated.embedded.txt',
    absPath: path.join(fixtureRoot, 'signed/ed25519/generated.embedded.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/ed25519/partial.txt',
    absPath: path.join(fixtureRoot, 'signed/ed25519/partial.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/ed25519/partial.early.txt',
    absPath: path.join(fixtureRoot, 'signed/ed25519/partial.early.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/ed25519/partial.embedded.txt',
    absPath: path.join(fixtureRoot, 'signed/ed25519/partial.embedded.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/p256/generated.txt',
    absPath: path.join(fixtureRoot, 'signed/p256/generated.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/p256/generated.embedded.txt',
    absPath: path.join(fixtureRoot, 'signed/p256/generated.embedded.txt'),
    sourceType: 'generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/p256/partial.txt',
    absPath: path.join(fixtureRoot, 'signed/p256/partial.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/p256/partial.early.txt',
    absPath: path.join(fixtureRoot, 'signed/p256/partial.early.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
  {
    name: 'signed/p256/partial.embedded.txt',
    absPath: path.join(fixtureRoot, 'signed/p256/partial.embedded.txt'),
    sourceType: 'partially-generated',
    isWellFormed: true,
    isSigned: true,
    isValidSignature: true,
  },
];

const invalidFiles: InvalidGeneratedFile[] = [
  {
    name: 'invalid/generated.no_token.txt',
    absPath: path.join(fixtureRoot, 'invalid/generated.no_token.txt'),
    sourceType: 'generated',
    isWellFormed: false,
  },
  {
    name: 'invalid/partial.no_token.txt',
    absPath: path.join(fixtureRoot, 'invalid/partial.no_token.txt'),
    sourceType: 'partially-generated',
    isWellFormed: false,
  },
  {
    name: 'invalid/partial.open_section.txt',
    absPath: path.join(fixtureRoot, 'invalid/partial.open_section.txt'),
    sourceType: 'partially-generated',
    isWellFormed: false,
  },
];

let inputFilesPromise: Promise<InputFile[]> | null = null;

export function getInputFiles(): Promise<InputFile[]> {
  inputFilesPromise ??= (async (): Promise<InputFile[]> => {
    const allFileNames = new Set(
      await listFileNamesRecursive(path.join(__dirname, '..', 'fixtures'), {
        dirOnly: true,
      }),
    );

    const inputFiles: InputFile[] = [
      ...manualFiles,
      ...unsignedFiles,
      ...signedFiles,
      ...invalidFiles,
    ];

    for (const inputFile of inputFiles) {
      allFileNames.delete(inputFile.name);
    }

    for (const remaining of Array.from(allFileNames)) {
      if (remaining.endsWith('.test.ts')) {
        allFileNames.delete(remaining);
      }
    }

    if (allFileNames.size !== 0) {
      throw new Error(
        `Input files are missing: ${Array.from(allFileNames).join(', ')}`,
      );
    }

    return inputFiles;
  })();

  return inputFilesPromise;
}

interface ListFileOptions {
  dirOnly: boolean;
  prefix?: string;
}

async function listFileNamesRecursive(
  root: string,
  { dirOnly, prefix }: ListFileOptions,
): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });

  const fileNames: string[][] = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && entry.name !== '__snapshots__')
      .map((entry) =>
        listFileNamesRecursive(path.join(root, entry.name), {
          dirOnly: false,
          prefix: entry.name,
        }),
      ),
  );

  if (!dirOnly) {
    fileNames.push(
      entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
    );
  }

  let flattenedFileNames = fileNames.flat();

  if (prefix !== undefined) {
    flattenedFileNames = flattenedFileNames.map((fileName) =>
      path.join(prefix, fileName),
    );
  }

  return flattenedFileNames;
}
