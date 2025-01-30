import { GeneratedTagNotFoundError, UnsignedDataError } from './errors';
import { hash, parseContent } from './impl';

export default function verifyCode(signedData: string): boolean {
  const content = parseContent(signedData);
  if (!content.generated) {
    throw new GeneratedTagNotFoundError();
  } else if (content.embeddedSignature === undefined) {
    throw new UnsignedDataError();
  }

  return content.embeddedSignature === hash(content.data);
}
