/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  BEGIN_MANUAL_SECTION_TOKEN,
  MismatchedManualSectionTokensError,
  MissingSignaturePlaceholderError,
  verifySignedSource,
} from '@ckwalsh/signedsource';

import type { RuleModule } from '@typescript-eslint/utils/ts-eslint';

const messages = {
  'invalid': `Invalid signature for generated file`,
  'missing-token': 'Could not find signature token',
  'mismatched-manual': 'Mismatched manual section tokens',
};

const TAG_REGEX = /@(?:partially-)generated/d;

export const validSignatureRule: RuleModule<keyof typeof messages> = {
  meta: {
    docs: {
      description: 'Validates that generated files a valid signedsource signature',
    },
    type: 'problem',
    messages,
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.sourceCode;

    return {
      Program() {
        const text = sourceCode.getText();

        const match = TAG_REGEX.exec(text);

        if (match?.indices === undefined) {
          return;
        }

        const [startIdx, endIdx] = match.indices[0];

        try {
          if (verifySignedSource(text)) {
            return;
          }

          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(startIdx),
              end: sourceCode.getLocFromIndex(endIdx),
            },
            messageId: 'invalid',
          });
        } catch (error) {
          if (error instanceof MissingSignaturePlaceholderError) {
            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(startIdx),
                end: sourceCode.getLocFromIndex(endIdx),
              },
              messageId: 'missing-token',
            });
          } else if (error instanceof MismatchedManualSectionTokensError) {
            const sectionTag = `${BEGIN_MANUAL_SECTION_TOKEN} ${error.fieldName}`;
            const startIdx = text.indexOf(sectionTag);
            const endIdx = startIdx + sectionTag.length;

            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(startIdx),
                end: sourceCode.getLocFromIndex(endIdx),
              },
              messageId: 'mismatched-manual',
            });
          }
        }
      },
    };
  },
};
