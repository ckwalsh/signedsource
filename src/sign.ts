/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getSignatureToken, parseContent } from './impl';
import { GeneratedTagNotFoundError } from './errors';
import { TOKEN } from './strings';

/**
 * Sign the given generated code, already containing a signature token, to
 * prevent accidental modification.
 *
 * @param unsignedData The unsigned code to sign. It is expected either the
 * `GENERATED_TOKEN` or `PARTIALLY_GENERATED_TOKEN` constant will be present.
 * @param oldData When signing a partially generated file, the old data to
 * extract manual section contents from.
 * @param forceManualOldData If oldData is provided but contains an invalid
 * signature, whether to attempt to proceed and potentially loose desireable
 * manual modifications.
 * @returns The signed code.
 */
export default function signCode(unsignedData: string, oldData?: string, forceManualOldData?: boolean): string {
  const { data: normalizedData, generated, partial, fields } = parseContent(unsignedData);

  if (!generated) {
    throw new GeneratedTagNotFoundError();
  }

  let signedData = normalizedData.replace(TOKEN, getSignatureToken(normalizedData));

  if (partial) {
    const { generated: oldGenerated, fields: oldFields } =
      oldData === undefined ? { generated: true, fields: {} } : parseContent(oldData);

    if (!oldGenerated && forceManualOldData !== true) {
      throw new GeneratedTagNotFoundError();
    }

    const combinedFields = {
      ...oldFields,
      ...fields,
    };

    for (const name in combinedFields) {
      const f = fields[name];
      signedData = signedData.replace(f.token, f.data);
    }
  }

  return signedData;
}
