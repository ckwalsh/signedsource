import {
  BEGIN_MANUAL_SECTION_PATTERN,
  BEGIN_MANUAL_SECTION_TOKEN,
  END_MANUAL_SECTION_TOKEN,
  GENERATED_TAG,
  GENERATED_TOKEN,
  PARTIALLY_GENERATED_TAG,
  PARTIALLY_GENERATED_TOKEN,
  SIGNED_TOKEN_PATTERN,
  TOKEN,
  UNSIGNED_TOKEN_PATTERN,
} from './strings';
import { MismatchedManualSectionTokensError, TokenNotFoundError } from './errors';
import { createHash } from 'crypto';

export function hash(data: string): string {
  return createHash('md5').update(data, 'utf8').digest('hex');
}

export function getSignatureToken(data: string): string {
  return `SignedSource<<${hash(data)}>>`;
}

export function getPartiallyGeneratedFieldToken(field: string): string {
  return `PartiallyGeneratedField<<${hash(field)}>>`;
}

interface ContentBase {
  data: string;
  generated: boolean;
  partial: boolean;
  embeddedSignature: string | undefined;
  fields: Record<string, { data: string; token: string }>;
}

interface ManualContent extends ContentBase {
  generated: false;
  partial: false;
  embeddedSignature: undefined;
}

interface FullyGeneratedContent extends ContentBase {
  generated: true;
  partial: false;
}

interface PartiallyGeneratedContent extends ContentBase {
  generated: true;
  partial: true;
}

type Content = ManualContent | FullyGeneratedContent | PartiallyGeneratedContent;

export function parseContent(data: string): Content {
  let generated = data.includes(GENERATED_TAG);
  const partial = !generated && data.includes(PARTIALLY_GENERATED_TAG);
  let embeddedSignature = undefined;
  const fields: Record<string, { data: string; token: string }> = {};

  if (!generated && !partial) {
    return {
      data,
      generated,
      partial,
      embeddedSignature,
      fields,
    };
  }

  generated = true;

  const unsignedTokenMatch = data.match(UNSIGNED_TOKEN_PATTERN);
  const signedTokenMatch = unsignedTokenMatch === null ? data.match(SIGNED_TOKEN_PATTERN) : null;

  if (unsignedTokenMatch === null) {
    if (signedTokenMatch === null) {
      throw new TokenNotFoundError(partial ? PARTIALLY_GENERATED_TOKEN : GENERATED_TOKEN);
    } else {
      data = data.replace(signedTokenMatch[1], TOKEN);
      embeddedSignature = signedTokenMatch[2];
    }
  }

  if (!partial) {
    return {
      data,
      generated,
      partial,
      embeddedSignature,
      fields,
    };
  }

  const dataByManualSectionBegin = data.split(BEGIN_MANUAL_SECTION_PATTERN);

  const normalizedParts = [dataByManualSectionBegin[0]];

  for (let i = 1; i < dataByManualSectionBegin.length; i += 2) {
    const fieldName = dataByManualSectionBegin[i];
    const [fieldData, generatedCodeAfter] = dataByManualSectionBegin[i + 1].split(END_MANUAL_SECTION_TOKEN, 2);
    if (generatedCodeAfter === undefined) {
      throw new MismatchedManualSectionTokensError(fieldName);
    }
    const fieldToken = getPartiallyGeneratedFieldToken(fieldName);
    fields[fieldName] = {
      data: fieldData,
      token: fieldToken,
    };
    normalizedParts.push(`${BEGIN_MANUAL_SECTION_TOKEN} ${fieldName}`);
    normalizedParts.push(fieldToken);
    normalizedParts.push(END_MANUAL_SECTION_TOKEN);
    normalizedParts.push(generatedCodeAfter);
  }

  data = normalizedParts.join('');

  return {
    data,
    generated,
    partial,
    embeddedSignature,
    fields,
  };
}
