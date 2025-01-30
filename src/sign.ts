import { getSignatureToken, parseContent } from './impl';
import { GeneratedTagNotFoundError } from './errors';
import { TOKEN } from './strings';

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
