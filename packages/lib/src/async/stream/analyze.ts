/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { UnderlyingSink } from 'node:stream/web';

import type {
  EmbeddedSignatureToken,
  SignedSourceAnalysis,
  SourceType,
} from '../../types.ts';
import { type HasherIf, NeverHasher } from '../../utils/hasher/common.ts';
import { Hasher } from '../../utils/hasher/index.ts';
import { DEFAULT_PLACEHOLDER_TOKEN, parseToken } from '../../utils/token.ts';
import type { Node } from './nodes.ts';

interface StalledData {
  signed: boolean;
  data: string;
}

export interface AnalyzeSinkOptions {
  __hasherFnForTesting?: (() => HasherIf) | undefined;
}

const IS_PRODUCTION = process.env['NODE_ENV'] === 'production';

export class AnalyzeSink implements UnderlyingSink<Node> {
  analysis: SignedSourceAnalysis | null = null;

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

  #hasher: HasherIf;

  constructor(options: AnalyzeSinkOptions) {
    if (IS_PRODUCTION) {
      this.#hasher = new Hasher();
    } else {
      this.#hasher = options.__hasherFnForTesting
        ? options.__hasherFnForTesting()
        : new Hasher();
    }
  }

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
          case 'generated': {
            for (const d of this.#stallBuffer) {
              this.#hasher.update(d.data);
            }
            this.#manualSectionOpen = false;
            this.#manualSectionId = '';
            this.#manualSectionChunks.length = 0;
            this.#manualSections = {};
            break;
          }
          case 'partially-generated': {
            for (const d of this.#stallBuffer) {
              if (d.signed) {
                this.#hasher.update(d.data);
              }
            }
            break;
          }
          case 'manual': {
            this.#manualSectionOpen = false;
            this.#manualSectionId = '';
            this.#manualSectionChunks.length = 0;
            this.#manualSections = {};
            this.#hasher = new NeverHasher();
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
    if (!IS_PRODUCTION && this.analysis !== null) {
      throw new Error('analysis should be null when closing');
    }

    this.analysis = await this.#createAnalysis();
  }

  async #createAnalysis(): Promise<SignedSourceAnalysis> {
    if (this.#sourceType === null) {
      throw new Error('Unknown source type');
    }

    if (this.#sourceType === 'manual') {
      if (!IS_PRODUCTION && this.#stallBuffer.length > 0) {
        throw new Error('StallBuffer should be empty for manual sources');
      }

      return { sourceType: 'manual' };
    }

    if (this.#embeddedSignature === null) {
      throw new Error('Unable to find signature token');
    }

    if (this.#manualSectionOpen) {
      throw new Error('Unclosed manual section');
    }

    if (!IS_PRODUCTION && this.#stallHash) {
      throw new Error('Hashing should not be stalled at flush');
    }

    const contentHashes = await this.#hasher.digest();

    if (this.#sourceType === 'generated') {
      return {
        sourceType: 'generated',
        embeddedSignature: this.#embeddedSignature,
        contentHashes,
      };
    } else {
      return {
        sourceType: 'partially-generated',
        manualSections: this.#manualSections,
        embeddedSignature: this.#embeddedSignature,
        contentHashes,
      };
    }
  }
}
