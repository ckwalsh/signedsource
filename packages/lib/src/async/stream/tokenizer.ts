/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Transformer } from 'node:stream/web';

import {
  BEGIN_MANUAL_SECTION,
  END_MANUAL_SECTION,
  GENERATED_TAG,
  PARTIALLY_GENERATED_TAG,
  SIGNED_TOKEN_PREFIX,
  TOKEN_SUFFIX,
  UNSIGNED_TOKEN_PREFIX,
} from '../../constants.ts';
import type { SourceType } from '../../types.ts';
import type { Node } from './nodes.ts';

const GENERATED_TAG_NEEDLE = GENERATED_TAG + ' ';
const PARTIALLY_GENERATED_TAG_NEEDLE = PARTIALLY_GENERATED_TAG + ' ';
const MANUAL_SECTION_START_NEEDLE = BEGIN_MANUAL_SECTION + ' ';
const MANUAL_SECTION_ID_END_REGEXP = /[^a-zA-Z0-9]/;

interface TokenizeTransformerOptions {
  sourceType?: 'generated' | 'partially-generated' | undefined;
}

export class TokenizeTransformer implements Transformer<string, Node> {
  #data = '';
  #sourceType: SourceType | null = null;
  #tagFound = false;
  #tokenPrefixComplete = false;
  #tokenComplete = false;
  #manualSectionOpen = false;
  #manualSectionIdComplete = false;

  constructor(options: TokenizeTransformerOptions = {}) {
    this.#sourceType = options.sourceType ?? null;
  }

  start(controller: TransformStreamDefaultController<Node>): void {
    // Initialize any state if necessary
    if (this.#sourceType !== null) {
      controller.enqueue({
        type: 'SignedSourceType',
        sourceType: this.#sourceType,
      });
    }
  }

  transform(
    chunk: string,
    controller: TransformStreamDefaultController<Node>,
  ): void {
    this.#data += chunk;

    while (this.#process(controller));
  }

  #process(controller: TransformStreamDefaultController<Node>): boolean {
    if (!this.#tagFound) {
      switch (this.#sourceType) {
        case 'generated':
          this.#lookForGeneratedTag(controller);
          break;
        case 'partially-generated':
          this.#lookForPartiallyGeneratedTag(controller);
          break;
        case null:
          this.#lookForGeneratedOrPartiallyGeneratedTag(controller);
          break;
      }
    }

    if (!this.#tokenComplete && this.#tagFound) {
      if (!this.#tokenPrefixComplete) {
        let node: Node;
        if (this.#data.startsWith(SIGNED_TOKEN_PREFIX)) {
          node = {
            type: 'SignedSignatureTokenStart',
            unsignedData: SIGNED_TOKEN_PREFIX,
            signature: true,
          };
        } else if (this.#data.startsWith(UNSIGNED_TOKEN_PREFIX)) {
          node = {
            type: 'UnsignedSignatureTokenStart',
            unsignedData: UNSIGNED_TOKEN_PREFIX,
            signature: true,
          };
        } else if (
          this.#data.length > SIGNED_TOKEN_PREFIX.length &&
          this.#data.length > UNSIGNED_TOKEN_PREFIX.length
        ) {
          throw new Error(
            'Expected signed or unsigned token prefix, but found neither.',
          );
        } else {
          return false;
        }

        this.#tokenPrefixComplete = true;
        this.#data = this.#data.slice(node.unsignedData.length);
        controller.enqueue(node);
      }

      const pos = this.#data.indexOf(TOKEN_SUFFIX);
      if (pos === -1) {
        const unsignedData = this.#data.slice(0, 1 - TOKEN_SUFFIX.length);
        this.#data = this.#data.slice(unsignedData.length);

        if (unsignedData.length > 0) {
          controller.enqueue({
            type: 'SignatureData',
            unsignedData,
            signature: true,
          });
        }

        return false;
      } else {
        const unsignedData = this.#data.slice(0, pos);

        if (unsignedData.length > 0) {
          controller.enqueue({
            type: 'SignatureData',
            unsignedData,
            signature: true,
          });
        }

        this.#data = this.#data.slice(pos + TOKEN_SUFFIX.length);

        controller.enqueue({
          type: 'SignatureTokenEnd',
          unsignedData: TOKEN_SUFFIX,
          signature: true,
        });
      }

      this.#tokenComplete = true;
    }

    switch (this.#sourceType) {
      case 'generated':
        if (this.#tagFound) {
          if (this.#data.length > 0) {
            controller.enqueue({
              type: 'SignedSource',
              signedData: this.#data,
            });
            this.#data = '';
          }
        } else {
          const signedData = this.#data.slice(
            0,
            1 - GENERATED_TAG_NEEDLE.length,
          );
          if (signedData.length > 0) {
            this.#data = this.#data.slice(signedData.length);
            controller.enqueue({
              type: 'SignedSource',
              signedData,
            });
          }
        }
        return false;
      case 'partially-generated':
      case null:
        if (this.#manualSectionOpen) {
          if (this.#manualSectionIdComplete) {
            const pos = this.#data.indexOf(END_MANUAL_SECTION);
            if (pos === -1) {
              const unsignedData = this.#data.slice(
                0,
                1 - END_MANUAL_SECTION.length,
              );
              if (unsignedData.length > 0) {
                controller.enqueue({
                  type: 'ManualSectionContentData',
                  unsignedData,
                });
                this.#data = this.#data.slice(unsignedData.length);
              }
              return false;
            } else {
              const unsignedData = this.#data.slice(0, pos);
              if (unsignedData.length > 0) {
                controller.enqueue({
                  type: 'ManualSectionContentData',
                  unsignedData,
                });
              }
              controller.enqueue({
                type: 'ManualSectionEnd',
                signedData: END_MANUAL_SECTION,
              });
              this.#manualSectionOpen = false;
              this.#data = this.#data.slice(pos + END_MANUAL_SECTION.length);
              return true;
            }
          } else {
            const match = MANUAL_SECTION_ID_END_REGEXP.exec(this.#data);
            if (match === null) {
              if (this.#data.length > 0) {
                controller.enqueue({
                  type: 'ManualSectionIdData',
                  signedData: this.#data,
                });
                this.#data = '';
              }
              return false;
            } else {
              const signedData = this.#data.slice(0, match.index);
              if (signedData.length > 0) {
                controller.enqueue({
                  type: 'ManualSectionIdData',
                  signedData,
                });
              }
              this.#data = this.#data.slice(match.index);
              controller.enqueue({
                type: 'ManualSectionContentStart',
              });
              this.#manualSectionIdComplete = true;
              return true;
            }
          }
        } else {
          const pos = this.#data.indexOf(MANUAL_SECTION_START_NEEDLE);
          if (pos === -1) {
            const signedData = this.#data.slice(
              0,
              1 - MANUAL_SECTION_START_NEEDLE.length,
            );
            if (signedData.length > 0) {
              controller.enqueue({
                type: 'SignedSource',
                signedData,
              });
              this.#data = this.#data.slice(signedData.length);
            }
            return false;
          } else {
            if (pos > 0) {
              controller.enqueue({
                type: 'SignedSource',
                signedData: this.#data.slice(0, pos),
              });
            }

            controller.enqueue({
              type: 'ManualSectionStart',
              signedData: MANUAL_SECTION_START_NEEDLE,
            });

            this.#data = this.#data.slice(
              pos + MANUAL_SECTION_START_NEEDLE.length,
            );

            this.#manualSectionOpen = true;
            this.#manualSectionIdComplete = false;
            return true;
          }
        }
        break;
      case 'manual':
        if (this.#data.length > 0) {
          controller.enqueue({
            type: 'SignedSource',
            signedData: this.#data,
          });
          this.#data = '';
        }
        return false;
    }
  }

  #lookForGeneratedTag(controller: TransformStreamDefaultController<Node>) {
    const pos = this.#data.indexOf(GENERATED_TAG_NEEDLE);

    if (pos === -1) {
      return;
    }

    const end = pos + GENERATED_TAG_NEEDLE.length;
    const signedData = this.#data.slice(0, end);

    if (this.#manualSectionOpen) {
      controller.enqueue({
        type: 'ManualSectionEnd',
        signedData: '',
      });
      this.#manualSectionOpen = false;
    }

    controller.enqueue({
      type: 'SignedSource',
      signedData,
    });

    controller.enqueue({
      type: 'SignedSourceType',
      sourceType: 'generated',
    });

    this.#sourceType = 'generated';
    this.#tagFound = true;
    this.#data = this.#data.slice(end);
  }

  #lookForPartiallyGeneratedTag(
    controller: TransformStreamDefaultController<Node>,
  ) {
    if (this.#manualSectionOpen) {
      return;
    }

    const pos = this.#data.indexOf(PARTIALLY_GENERATED_TAG_NEEDLE);

    if (pos === -1) {
      return;
    }

    const end = pos + PARTIALLY_GENERATED_TAG_NEEDLE.length;
    const signedData = this.#data.slice(0, end);

    if (signedData.includes(BEGIN_MANUAL_SECTION)) {
      return;
    }

    controller.enqueue({
      type: 'SignedSource',
      signedData,
    });

    controller.enqueue({
      type: 'SignedSourceType',
      sourceType: 'partially-generated',
    });

    this.#sourceType = 'partially-generated';
    this.#tagFound = true;
    this.#data = this.#data.slice(end);
  }

  #lookForGeneratedOrPartiallyGeneratedTag(
    controller: TransformStreamDefaultController<Node>,
  ) {
    let generatedPos = this.#data.indexOf(GENERATED_TAG_NEEDLE);
    let partiallyGeneratedPos = this.#manualSectionOpen
      ? -1
      : this.#data.indexOf(PARTIALLY_GENERATED_TAG_NEEDLE);

    if (generatedPos === -1 && partiallyGeneratedPos === -1) {
      return;
    }

    if (generatedPos === -1) {
      generatedPos = Infinity;
    } else if (partiallyGeneratedPos === -1) {
      partiallyGeneratedPos = Infinity;
    }

    if (generatedPos < partiallyGeneratedPos) {
      controller.enqueue({
        type: 'SignedSourceType',
        sourceType: 'generated',
      });

      const end = generatedPos + GENERATED_TAG_NEEDLE.length;
      const signedData = this.#data.slice(0, end);

      controller.enqueue({
        type: 'SignedSource',
        signedData,
      });

      this.#sourceType = 'generated';
      this.#tagFound = true;
      this.#data = this.#data.slice(end);
    } else {
      const end = partiallyGeneratedPos + PARTIALLY_GENERATED_TAG_NEEDLE.length;
      const signedData = this.#data.slice(0, end);

      if (signedData.includes(BEGIN_MANUAL_SECTION)) {
        // tag that was found might exist inside manual section
        return;
      }

      controller.enqueue({
        type: 'SignedSource',
        signedData,
      });

      controller.enqueue({
        type: 'SignedSourceType',
        sourceType: 'partially-generated',
      });

      this.#sourceType = 'partially-generated';
      this.#tagFound = true;
      this.#data = this.#data.slice(end);
    }
  }

  flush(controller: TransformStreamDefaultController<Node>): void {
    if (this.#sourceType === null) {
      // Auto detect as manual file
      this.#sourceType = 'manual';

      controller.enqueue({
        type: 'SignedSourceType',
        sourceType: 'manual',
      });

      this.#tagFound = true;
      this.#tokenComplete = true;
      this.#manualSectionOpen = false;
    }

    if (!this.#tagFound) {
      throw new Error('Missing generated tag');
    }

    if (!this.#tokenComplete) {
      throw new Error('Incomplete signature token');
    }

    if (this.#manualSectionOpen) {
      throw new Error('Unclosed manual section');
    }

    if (this.#data.length > 0) {
      controller.enqueue({
        type: 'SignedSource',
        signedData: this.#data,
      });
      this.#data = '';
    }

    controller.terminate();
  }
}
