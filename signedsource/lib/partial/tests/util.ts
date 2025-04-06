/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, test } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface SignedSourceApi {
  signSource: (source: string, oldSource?: string) => string;
  verifySignedSource: (source: string) => boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function defineTests(api: SignedSourceApi) {
  const signedA = fs.readFileSync(path.join(__dirname, 'files', 'signed-a.txt'), 'utf8');
  const signedB = fs.readFileSync(path.join(__dirname, 'files', 'signed-b.txt'), 'utf8');
  const signedCombined = fs.readFileSync(path.join(__dirname, 'files', 'signed-combined.txt'), 'utf8');
  const unsignedA = fs.readFileSync(path.join(__dirname, 'files', 'unsigned-a.txt'), 'utf8');
  const unsignedB = fs.readFileSync(path.join(__dirname, 'files', 'unsigned-b.txt'), 'utf8');

  test('signSource unsigned a', () => {
    const actual = api.signSource(unsignedA);
    expect(actual).toHaveLength(unsignedA.length);
    expect(actual).toEqual(signedA);
  });

  test('signSource unsigned b', () => {
    const actual = api.signSource(unsignedB);
    expect(actual).toHaveLength(unsignedB.length);
    expect(actual).toEqual(signedB);
  });

  test('signSource unsigned combined', () => {
    const actual = api.signSource(unsignedB, unsignedA);
    expect(actual).toEqual(signedCombined);
  });

  test('signSource signed a', () => {
    const actual = api.signSource(signedA);
    expect(actual).toEqual(signedA);
  });

  test('signSource + verifySignedSource', () => {
    const newlySigned = api.signSource(unsignedA);
    expect(newlySigned).toHaveLength(unsignedA.length);

    const verified = api.verifySignedSource(newlySigned);
    expect(verified).toEqual(true);

    const doubleSigned = api.signSource(newlySigned);
    expect(doubleSigned).toEqual(newlySigned);
  });

  test('signSource + safe modify', () => {
    const newlySigned = api.signSource(unsignedA);
    expect(newlySigned).toHaveLength(unsignedA.length);

    const modifiedSigned = newlySigned.replace('Pumpkin', 'Cherry');
    expect(modifiedSigned).not.toEqual(newlySigned);

    const verified = api.verifySignedSource(modifiedSigned);
    expect(verified).toEqual(true);

    const doubleSigned = api.signSource(modifiedSigned);
    expect(doubleSigned).toEqual(modifiedSigned);
  });

  test('signSource + unsafe modify', () => {
    const newlySigned = api.signSource(unsignedA);
    expect(newlySigned).toHaveLength(unsignedA.length);

    const modifiedSigned = newlySigned.replace('Signed Content', 'Fudged Content');
    expect(modifiedSigned).not.toEqual(newlySigned);

    const verified = api.verifySignedSource(modifiedSigned);
    expect(verified).toEqual(false);
  });
}
