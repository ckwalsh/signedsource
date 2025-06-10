/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-unused-labels */

import type { HasherIf } from '#src/utils/hasher.ts';
import { Hasher, NEVER_HASHER } from '#src/utils/hasher.ts';
import type { Transformer } from 'node:stream/web';

import { NEVER_CONTENT_SIGNER } from '../content/never.ts';
import { DEFAULT_PLACEHOLDER_TOKEN, renderToken } from '../token.ts';
import type { ContentSignerIf } from '../types/content.ts';
import { SourceType } from '../types/impl/analyzer.ts';
import type { Node } from './nodes.ts';

export enum StalledDataType {
  SIGNED_DATA,
  MANUAL_DATA_EMBEDDED,
  MANUAL_DATA_OVERRIDDEN,
  MANUAL_DATA_OVERRIDE,
}

interface StalledData {
  type: StalledDataType;
  data: string;
  needsHashing: boolean;
  needsEnqueue: boolean;
}

export interface SignTransformerOptions {
  manualSectionOverrides?: Record<string, string>;
  signer: ContentSignerIf;
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
  #signer: ContentSignerIf;
  #hasher: HasherIf;

  constructor(options: SignTransformerOptions) {
    this.#manualSectionOverrides = options.manualSectionOverrides ?? {};
    this.#signer = options.signer;
    this.#hasher = new Hasher();
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
            ? StalledDataType.MANUAL_DATA_OVERRIDDEN
            : StalledDataType.MANUAL_DATA_EMBEDDED;
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
              type: StalledDataType.SIGNED_DATA,
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
          case SourceType.GENERATED: {
            for (const d of this.#stallBuffer) {
              if (d.type === StalledDataType.MANUAL_DATA_OVERRIDE) {
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
          case SourceType.PARTIALLY_GENERATED: {
            for (const d of this.#stallBuffer) {
              if (d.type === StalledDataType.MANUAL_DATA_OVERRIDDEN) {
                continue;
              }
              if (d.type === StalledDataType.SIGNED_DATA && d.needsHashing) {
                this.#hasher.update(d.data);
              }
              if (d.needsEnqueue) {
                controller.enqueue(d.data);
              }
            }
            break;
          }
          case SourceType.MANUAL: {
            for (const d of this.#stallBuffer) {
              if (d.type === StalledDataType.MANUAL_DATA_OVERRIDE) {
                continue;
              }
              if (d.needsEnqueue) {
                controller.enqueue(d.data);
              }
            }
            this.#manualSectionOpen = false;
            this.#manualSectionIdChunks.length = 0;
            this.#manualSectionOverrides = {};
            this.#hasher = NEVER_HASHER;
            DEBUG: this.#signer = NEVER_CONTENT_SIGNER;
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
              type: StalledDataType.MANUAL_DATA_OVERRIDE,
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
    } else if (this.#sourceType === SourceType.MANUAL) {
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
      this.#sourceType === SourceType.PARTIALLY_GENERATED
        ? StalledDataType.MANUAL_DATA_OVERRIDDEN
        : StalledDataType.MANUAL_DATA_OVERRIDE;

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
