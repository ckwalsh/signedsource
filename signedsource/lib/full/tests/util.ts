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
import { MissingSignaturePlaceholderError, UnsignedDataError } from '../../errors.js';

interface SignedSourceApi {
  signSource: (source: string) => string;
  verifySignedSource: (source: string) => boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function defineTests(api: SignedSourceApi) {
  const missingBoth = fs.readFileSync(path.join(__dirname, 'files', 'missing-both.txt'), 'utf8');
  const missingTagSigned = fs.readFileSync(path.join(__dirname, 'files', 'missing-tag-signed.txt'), 'utf8');
  const missingTagUnsigned = fs.readFileSync(path.join(__dirname, 'files', 'missing-tag-unsigned.txt'), 'utf8');
  const missingToken = fs.readFileSync(path.join(__dirname, 'files', 'missing-token.txt'), 'utf8');
  const signedInvalid = fs.readFileSync(path.join(__dirname, 'files', 'signed-invalid.txt'), 'utf8');
  const signedMangled = fs.readFileSync(path.join(__dirname, 'files', 'signed-mangled.txt'), 'utf8');
  const signed = fs.readFileSync(path.join(__dirname, 'files', 'signed.txt'), 'utf8');
  const unsignedMangled = fs.readFileSync(path.join(__dirname, 'files', 'unsigned-mangled.txt'), 'utf8');
  const unsigned = fs.readFileSync(path.join(__dirname, 'files', 'unsigned.txt'), 'utf8');

  test('signSource unsigned', () => {
    const actual = api.signSource(unsigned);
    expect(actual).toHaveLength(unsigned.length);
    expect(actual).toEqual(signed);
  });

  test('signSource unsigned mangled', () => {
    expect(() => api.signSource(unsignedMangled)).toThrow(MissingSignaturePlaceholderError);
  });

  test('signSource signed', () => {
    const actual = api.signSource(signed);
    expect(actual).toEqual(signed);
  });

  test('signSource signed invalid', () => {
    const actual = api.signSource(signedInvalid);
    expect(actual).toHaveLength(signedInvalid.length);
    expect(actual).toEqual(signed);
  });

  test('signSource signed mangled', () => {
    expect(() => api.signSource(signedMangled)).toThrow(MissingSignaturePlaceholderError);
  });

  test('signSource missing both', () => {
    expect(() => api.signSource(missingBoth)).toThrow(MissingSignaturePlaceholderError);
  });

  test('signSource missing tag signed', () => {
    expect(() => api.signSource(missingTagSigned)).toThrow(MissingSignaturePlaceholderError);
  });

  test('signSource missing tag unsigned', () => {
    expect(() => api.signSource(missingTagUnsigned)).toThrow(MissingSignaturePlaceholderError);
  });

  test('signSource missing token', () => {
    expect(() => api.signSource(missingToken)).toThrow(MissingSignaturePlaceholderError);
  });

  test('verifySignedSource signed', () => {
    const verified = api.verifySignedSource(signed);
    expect(verified).toEqual(true);
  });

  test('verifySignedSource signed invalid', () => {
    const verified = api.verifySignedSource(signedInvalid);
    expect(verified).toEqual(false);
  });

  test('verifySignedSource signed mangled', () => {
    expect(() => api.verifySignedSource(signedMangled)).toThrow(MissingSignaturePlaceholderError);
  });

  test('verifySignedSource unsigned', () => {
    expect(() => api.verifySignedSource(unsigned)).toThrow(UnsignedDataError);
  });

  test('verifySignedSource unsigned mangled', () => {
    expect(() => api.verifySignedSource(unsignedMangled)).toThrow(MissingSignaturePlaceholderError);
  });

  test('verifySignedSource missing both', () => {
    expect(() => api.verifySignedSource(missingBoth)).toThrow(MissingSignaturePlaceholderError);
  });

  test('verifySignedSource missing tag signed', () => {
    expect(() => api.verifySignedSource(missingTagSigned)).toThrow(MissingSignaturePlaceholderError);
  });

  test('verifySignedSource missing tag unsigned', () => {
    expect(() => api.verifySignedSource(missingTagUnsigned)).toThrow(MissingSignaturePlaceholderError);
  });

  test('verifySignedSource missing token', () => {
    expect(() => api.verifySignedSource(missingToken)).toThrow(MissingSignaturePlaceholderError);
  });

  test('signSource + verifySignedSource', () => {
    const newlySigned = api.signSource(unsigned);
    expect(newlySigned).toHaveLength(unsigned.length);

    const verified = api.verifySignedSource(newlySigned);
    expect(verified).toEqual(true);

    const doubleSigned = api.signSource(newlySigned);
    expect(doubleSigned).toEqual(newlySigned);
  });
}
