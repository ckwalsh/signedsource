/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-unused-labels */

import type { Transformer } from 'node:stream/web';

import { parseToken, renderPlaceholderToken } from '../token.ts';
import type { ContentSignerIf } from '../types/content.ts';
import { SourceType } from '../types/impl/analyzer.ts';
import type { Node } from './nodes.ts';
import { StalledDataType } from './sign.ts';

interface StalledData {
  type: StalledDataType;
  data: string;
}

interface UnsignTransformerOptions {
  manualSectionOverrides?: Record<string, string>;
  signer?: ContentSignerIf;
}

export class UnsignTransformer implements Transformer<Node, string> {
  #sourceType: SourceType | null = null;
  #tokenCompleted = false;

  #stallEnqueue = false;
  #stallBuffer: StalledData[] = [];

  #manualSectionOpen = false;
  #manualSectionIdChunks: string[] = [];
  #manualSectionContentOverridden = false;

  #signatureChunks: string[] = [];

  #manualSectionOverrides: Record<string, string>;
  #signer: ContentSignerIf | null;

  constructor(options: UnsignTransformerOptions) {
    this.#manualSectionOverrides = options.manualSectionOverrides ?? {};
    this.#signer = options.signer ?? null;
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
          });
        } else if (!this.#manualSectionContentOverridden) {
          controller.enqueue(node.unsignedData);
        }
        break;
      default: {
        const data = node.signedData ?? node.unsignedData;
        if (data !== undefined) {
          if (this.#stallEnqueue) {
            const type =
              node.signedData === undefined
                ? this.#manualSectionContentOverridden
                  ? StalledDataType.MANUAL_DATA_OVERRIDDEN
                  : StalledDataType.MANUAL_DATA_EMBEDDED
                : StalledDataType.SIGNED_DATA;
            this.#stallBuffer.push({
              type,
              data,
            });
          } else {
            controller.enqueue(data);
          }
        }
      }
    }

    switch (node.type) {
      case 'SignedSourceType': {
        const skipDataType =
          node.sourceType === SourceType.PARTIALLY_GENERATED
            ? StalledDataType.MANUAL_DATA_OVERRIDDEN
            : StalledDataType.MANUAL_DATA_OVERRIDE;
        for (const d of this.#stallBuffer) {
          if (d.type === skipDataType) {
            continue;
          }
          controller.enqueue(d.data);
        }
        this.#sourceType = node.sourceType;
        this.#stallEnqueue = false;
        this.#stallBuffer.length = 0;
        break;
      }
      case 'SignedSource':
        // Nothing special to do
        break;
      case 'ManualSectionStart':
        this.#manualSectionOpen = true;
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
      case 'SignatureData':
        if (this.#signer === null) {
          this.#signatureChunks.push(node.unsignedData);
        }
        break;
      case 'SignatureTokenEnd':
        this.#tokenCompleted = true;
        if (this.#signer === null) {
          this.#signatureChunks.push(node.unsignedData);
          const signatureRaw = this.#signatureChunks.join('');
          this.#signatureChunks.length = 0;

          const signature = parseToken(signatureRaw);

          controller.enqueue(renderPlaceholderToken(signature));
        } else {
          controller.enqueue(this.#signer.PLACEHOLDER);
        }
        break;
    }
  }

  flush(_controller: TransformStreamDefaultController<string>) {
    if (this.#sourceType === null) {
      throw new Error('Unknown source type');
    } else if (this.#sourceType === SourceType.MANUAL) {
      throw new Error('Cannot unsign manual source');
    }

    if (!this.#tokenCompleted) {
      throw new Error('Unable to find signature token');
    }

    if (this.#manualSectionOpen) {
      throw new Error('Unclosed manual section');
    }

    DEBUG: if (this.#stallEnqueue)
      throw new Error('Enqueueing should not be stalled at flush');
    DEBUG: if (this.#stallBuffer.length > 0)
      throw new Error('StallBuffer should be empty at flush');
  }
}
