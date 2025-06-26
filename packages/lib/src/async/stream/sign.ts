/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Transformer } from 'node:stream/web';

import type { SourceType } from '../../types.ts';
import { NeverHasher } from '../../utils/hasher/common.ts';
import { Hasher } from '../../utils/hasher/index.ts';
import type { HasherIf } from '../../utils/hasher/index.ts';
import { DEFAULT_PLACEHOLDER_TOKEN, renderToken } from '../../utils/token.ts';
import type { SignedContentSignerIf } from '../api/sign.ts';
import { NeverSignedContentSignerValidator } from '../signatures/never.ts';
import type { Node } from './nodes.ts';

/* eslint-disable no-unused-labels */

export type StalledDataType =
  | 'signed'
  | 'manual-embedded'
  | 'manual-overridden'
  | 'manual-override';

interface StalledData {
  type: StalledDataType;
  data: string;
  needsHashing: boolean;
  needsEnqueue: boolean;
}

export interface SignTransformerOptions {
  signer: SignedContentSignerIf;
  manualSectionOverrides?: Record<string, string>;
  __hasherFnForTesting?: (() => HasherIf) | undefined;
}

export class SignTransformer implements Transformer<Node, string> {
  #sourceType: SourceType | null = null;
  #tokenCompleted = false;

  #stallHash = false;
  #stallEnqueue = false;
  #stallBuffer: StalledData[] = [];

  #manualSectionOpen = false;
  #manualSectionIdChunks: string[] = [];
  #manualSectionContentOverridden = false;

  #manualSectionOverrides: Record<string, string>;
  #signer: SignedContentSignerIf;
  #hasher: HasherIf;

  constructor(options: SignTransformerOptions) {
    this.#signer = options.signer;
    this.#manualSectionOverrides = options.manualSectionOverrides ?? {};
    this.#hasher = options.__hasherFnForTesting
      ? options.__hasherFnForTesting()
      : new Hasher();
  }

  transform(node: Node, controller: TransformStreamDefaultController<string>) {
    switch (node.type) {
      case 'SignedSignatureTokenStart':
      case 'UnsignedSignatureTokenStart':
      case 'SignatureData':
      case 'SignatureTokenEnd':
        break;
      case 'ManualSectionContentData':
        if (this.#stallEnqueue) {
          const type = this.#manualSectionContentOverridden
            ? 'manual-overridden'
            : 'manual-embedded';
          this.#stallBuffer.push({
            type,
            data: node.unsignedData,
            needsHashing: this.#stallHash,
            needsEnqueue: this.#stallEnqueue,
          });
        } else if (!this.#manualSectionContentOverridden) {
          controller.enqueue(node.unsignedData);
        }
        break;
      default:
        if (node.signedData !== undefined) {
          if (!this.#stallHash) {
            this.#hasher.update(node.signedData);
          }
          if (!this.#stallEnqueue) {
            controller.enqueue(node.signedData);
          }
          if (this.#stallHash || this.#stallEnqueue) {
            this.#stallBuffer.push({
              type: 'signed',
              data: node.signedData,
              needsHashing: this.#stallHash,
              needsEnqueue: this.#stallEnqueue,
            });
          }
        }
    }

    switch (node.type) {
      case 'SignedSourceType':
        switch (node.sourceType) {
          case 'generated': {
            for (const d of this.#stallBuffer) {
              if (d.type === 'manual-override') {
                continue;
              }
              if (d.needsHashing) {
                this.#hasher.update(d.data);
              }
              if (d.needsEnqueue) {
                controller.enqueue(d.data);
              }
            }
            this.#manualSectionOpen = false;
            this.#manualSectionIdChunks.length = 0;
            this.#manualSectionOverrides = {};
            break;
          }
          case 'partially-generated': {
            for (const d of this.#stallBuffer) {
              if (d.type === 'manual-overridden') {
                continue;
              }
              if (d.type === 'signed' && d.needsHashing) {
                this.#hasher.update(d.data);
              }
              if (d.needsEnqueue) {
                controller.enqueue(d.data);
              }
            }
            break;
          }
          case 'manual': {
            for (const d of this.#stallBuffer) {
              if (d.type === 'manual-override') {
                continue;
              }
              if (d.needsEnqueue) {
                controller.enqueue(d.data);
              }
            }
            this.#manualSectionOpen = false;
            this.#manualSectionIdChunks.length = 0;
            this.#manualSectionOverrides = {};
            this.#hasher = new NeverHasher();
            DEBUG: this.#signer = new NeverSignedContentSignerValidator();
            break;
          }
        }
        this.#sourceType = node.sourceType;
        this.#stallHash = false;
        this.#stallEnqueue = false;
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
        this.#manualSectionIdChunks.push(node.signedData);
        break;
      case 'ManualSectionContentStart': {
        const id = this.#manualSectionIdChunks.join('');
        this.#manualSectionIdChunks.length = 0;

        const overrideContents = this.#manualSectionOverrides[id];

        if (overrideContents === undefined) {
          this.#manualSectionContentOverridden = false;
        } else {
          this.#manualSectionContentOverridden = true;

          if (this.#sourceType === null) {
            this.#stallEnqueue = true;
          }

          if (this.#stallEnqueue) {
            this.#stallBuffer.push({
              type: 'manual-override',
              data: overrideContents,
              needsHashing: false,
              needsEnqueue: true,
            });
          } else {
            controller.enqueue(overrideContents);
          }
        }
        break;
      }
      case 'ManualSectionContentData':
        // Nothing to do
        break;
      case 'ManualSectionEnd':
        this.#manualSectionOpen = false;
        break;
      case 'SignedSignatureTokenStart':
      case 'UnsignedSignatureTokenStart':
        this.#hasher.update(DEFAULT_PLACEHOLDER_TOKEN);
        this.#stallEnqueue = true;
        break;
      case 'SignatureData':
        // Nothing to do
        break;
      case 'SignatureTokenEnd':
        this.#tokenCompleted = true;
        break;
    }
  }

  async flush(
    controller: TransformStreamDefaultController<string>,
  ): Promise<void> {
    if (this.#sourceType === null) {
      throw new Error('Unknown source type');
    } else if (this.#sourceType === 'manual') {
      throw new Error('Cannot sign manual source');
    }

    if (!this.#tokenCompleted) {
      throw new Error('Unable to find signature token');
    }

    if (this.#manualSectionOpen) {
      throw new Error('Unclosed manual section');
    }

    DEBUG: if (this.#stallHash)
      throw new Error('Hashing should not be stalled at flush');
    DEBUG: if (!this.#stallEnqueue)
      throw new Error('Enqueueing should be stalled at flush');

    const hashes = await this.#hasher.digest();
    const signature = await this.#signer.sign(hashes);

    controller.enqueue(renderToken(signature));

    const skipDataType =
      this.#sourceType === 'partially-generated'
        ? 'manual-overridden'
        : 'manual-override';

    for (const d of this.#stallBuffer) {
      if (d.type === skipDataType) {
        continue;
      }
      controller.enqueue(d.data);
    }

    this.#stallBuffer.length = 0;
    controller.terminate();
  }
}
