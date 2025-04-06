/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getSignatureToken, signatureHash } from '../hash.js';
import { END_MANUAL_SECTION_TOKEN } from './constants.js';
import { MismatchedManualSectionTokensError } from './errors.js';

export interface PartiallySignedSource {
  signedChunks: string[];
  manualChunkIds: string[];
  manualChunkContents: Record<string, string>;
  signature: string;
}

const BEGIN_MANUAL_SECTION_PATTERN = /BEGIN MANUAL SECTION ([0-9a-zA-Z_-]+)/g;

export function parsePartiallySignedSource(source: string): PartiallySignedSource {
  const signedChunks: string[] = [];
  const manualChunkIds: string[] = [];
  const manualChunkContents: Record<string, string> = {};
  const hash = signatureHash();

  let signedChunkStartIdx = 0;
  BEGIN_MANUAL_SECTION_PATTERN.lastIndex = -1;
  let manualSectionBeginMatch = BEGIN_MANUAL_SECTION_PATTERN.exec(source);

  while (manualSectionBeginMatch !== null) {
    const manualSectionStartIdx = manualSectionBeginMatch.index + manualSectionBeginMatch[0].length;
    const signedChunk = source.slice(signedChunkStartIdx, manualSectionStartIdx);
    hash.update(signedChunk);
    signedChunks.push(signedChunk);

    const manualSectionId = manualSectionBeginMatch[1];
    manualChunkIds.push(manualSectionId);

    signedChunkStartIdx = source.indexOf(END_MANUAL_SECTION_TOKEN, manualSectionStartIdx);
    if (signedChunkStartIdx === -1) {
      throw new MismatchedManualSectionTokensError(manualSectionId);
    }

    const manualChunkContent = source.slice(manualSectionStartIdx, signedChunkStartIdx);
    manualChunkContents[manualSectionId] = manualChunkContent;
    manualSectionBeginMatch = BEGIN_MANUAL_SECTION_PATTERN.exec(source);
  }

  const signedChunk = source.slice(signedChunkStartIdx);
  signedChunks.push(signedChunk);
  hash.update(signedChunk);
  const signature = getSignatureToken(hash);

  return {
    signedChunks,
    manualChunkIds,
    manualChunkContents,
    signature,
  };
}

export function assemblePartiallySignedSource(
  { signedChunks, manualChunkIds, manualChunkContents }: PartiallySignedSource,
  manualChunkOverrides: Record<string, string> = {},
): string {
  const chunks: string[] = [signedChunks[0]];

  for (let i = 0; i < manualChunkIds.length; i++) {
    const manualChunkId = manualChunkIds[i];
    const manualChunkContent = manualChunkOverrides[manualChunkId] ?? manualChunkContents[manualChunkId];
    chunks.push(manualChunkContent);

    chunks.push(signedChunks[i + 1]);
  }

  return chunks.join('');
}
