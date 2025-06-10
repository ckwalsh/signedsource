/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-unused-labels */

import type { HasherIf } from '#src/utils/hasher.ts';
import { Hasher, NEVER_HASHER } from '#src/utils/hasher.ts';
import type { UnderlyingSink } from 'node:stream/web';

import { DEFAULT_PLACEHOLDER_TOKEN, parseToken } from '../token.ts';
import type { SourceAnalysis } from '../types/impl/analyzer.ts';
import { SourceType } from '../types/impl/analyzer.ts';
import type { EmbeddedSignatureToken } from '../types/tokens.ts';
import type { Node } from './nodes.ts';

interface StalledData {
  signed: boolean;
  data: string;
}

export class AnalyzeSink implements UnderlyingSink<Node> {
  analysis: SourceAnalysis | null = null;

  #sourceType: SourceType | null = null;
  #embeddedSignature: EmbeddedSignatureToken | null = null;
  #manualSections: Record<string, string> = {};

  #stallHash = false;
  #stallBuffer: StalledData[] = [];

  #manualSectionOpen = false;
  #manualSectionId = '';
  #manualSectionChunks: string[] = [];

  #pos = 0;
  #signatureStartPos = 0;
  #signatureChunks: string[] = [];

  #hasher: HasherIf = new Hasher();

  write(node: Node) {
    const data = node.signedData ?? node.unsignedData;

    if (data !== undefined && !node.signature) {
      if (this.#stallHash) {
        this.#stallBuffer.push({
          signed: node.signedData !== undefined,
          data,
        });
      } else if (node.signedData !== undefined) {
        this.#hasher.update(node.signedData);
      }
    }

    switch (node.type) {
      case 'SignedSourceType':
        switch (node.sourceType) {
          case SourceType.GENERATED: {
            for (const d of this.#stallBuffer) {
              this.#hasher.update(d.data);
            }
            this.#manualSectionOpen = false;
            this.#manualSectionId = '';
            this.#manualSectionChunks.length = 0;
            this.#manualSections = {};
            break;
          }
          case SourceType.PARTIALLY_GENERATED: {
            for (const d of this.#stallBuffer) {
              if (d.signed) {
                this.#hasher.update(d.data);
              }
            }
            break;
          }
          case SourceType.MANUAL: {
            this.#manualSectionOpen = false;
            this.#manualSectionId = '';
            this.#manualSectionChunks.length = 0;
            this.#manualSections = {};
            this.#hasher = NEVER_HASHER;
            break;
          }
        }
        this.#sourceType = node.sourceType;
        this.#stallHash = false;
        this.#stallBuffer.length = 0;
        break;
      case 'SignedSource':
        // Nothing special to do
        break;
      case 'ManualSectionStart':
        this.#manualSectionOpen = true;
        if (this.#sourceType === null) {
          this.#stallHash = true;
        }
        break;
      case 'ManualSectionIdData':
        this.#manualSectionChunks.push(node.signedData);
        break;
      case 'ManualSectionContentStart': {
        this.#manualSectionId = this.#manualSectionChunks.join('');
        this.#manualSectionChunks.length = 0;
        break;
      }
      case 'ManualSectionContentData':
        this.#manualSectionChunks.push(node.unsignedData);
        break;
      case 'ManualSectionEnd':
        this.#manualSections[this.#manualSectionId] =
          this.#manualSectionChunks.join('');
        this.#manualSectionChunks.length = 0;
        this.#manualSectionOpen = false;
        break;
      case 'SignedSignatureTokenStart':
      case 'UnsignedSignatureTokenStart':
        this.#signatureStartPos = this.#pos;
        this.#signatureChunks.push(node.unsignedData);
        this.#hasher.update(DEFAULT_PLACEHOLDER_TOKEN);
        break;
      case 'SignatureData':
        this.#signatureChunks.push(node.unsignedData);
        break;
      case 'SignatureTokenEnd':
        this.#signatureChunks.push(node.unsignedData);
        this.#embeddedSignature = {
          ...parseToken(this.#signatureChunks.join('')),
          start: this.#signatureStartPos,
          end: this.#pos + node.unsignedData.length,
        };
        this.#signatureChunks.length = 0;
        break;
    }

    if (data !== undefined) {
      this.#pos += data.length;
    }
  }

  async close(): Promise<void> {
    DEBUG: if (this.analysis !== null)
      throw new Error('analysis should be null when closing');

    this.analysis = await this.#createAnalysis();
  }

  async #createAnalysis(): Promise<SourceAnalysis> {
    if (this.#sourceType === null) {
      throw new Error('Unknown source type');
    }

    if (this.#sourceType === SourceType.MANUAL) {
      DEBUG: if (this.#stallBuffer.length > 0)
        throw new Error('StallBuffer should be empty for manual sources');

      return { sourceType: SourceType.MANUAL };
    }

    if (this.#embeddedSignature === null) {
      throw new Error('Unable to find signature token');
    }

    if (this.#manualSectionOpen) {
      throw new Error('Unclosed manual section');
    }

    DEBUG: if (this.#stallHash)
      throw new Error('Hashing should not be stalled at flush');

    const contentHashes = await this.#hasher.digest();

    if (this.#sourceType === SourceType.GENERATED) {
      return {
        sourceType: SourceType.GENERATED,
        embeddedSignature: this.#embeddedSignature,
        contentHashes,
      };
    } else {
      return {
        sourceType: SourceType.PARTIALLY_GENERATED,
        manualSections: this.#manualSections,
        embeddedSignature: this.#embeddedSignature,
        contentHashes,
      };
    }
  }
}
