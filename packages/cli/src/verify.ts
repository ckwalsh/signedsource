/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Command, Option } from 'clipanion';
import fs from 'fs/promises';
import type { JWK } from 'jose';

import type { ContentVerifierIf } from '@ckwalsh/signedsource';
import {
  DEFAULT_CONTENT_VERIFIER,
  JWSContentVerifier,
  StreamSourceAnalyzer,
} from '@ckwalsh/signedsource';

import { SignedSourceCommandBase } from './base.ts';

export class VerifyCommand extends SignedSourceCommandBase {
  static override paths = [['verify']];
  static override usage = Command.Usage({
    description: 'Verify the signature of generated source code',
    details: `
      This command verifies that  @generated or @partially-generated source has
      not been modified, using a signature embedded in the file.

      Source code can be provided from a file argument or piped to stdin.
      
      By default, this command can only verify source signed using the md5 of
      the content (compatible with the signedsource library released by Meta)
      or using embedded JWKs (not backwards compatible with Meta's library).
      
      Neither of these methods are cryptographically secure, and should not be
      depended on as part of a verification process.
      
      If one or more JSON Web Key (JWK) files are provided using the --jwk
      flag, the file will be verified exclusively using those JWKs, enabling
      stronger verification guarantees. If you wish to verify using specified
      JWKs AND the md5 / embedded JWK methods, use the --insecure flag.

      This command will exit with a non-zero exit code if the file is unsigned
      or has been modified without the signature being updated.
      
      Output from this command can be suppressed using the --quiet flag.
    `,
    examples: [
      ['Verify a file', '$0 verify signed.js'],
      ['Verify source from stdin', '$0 verify signed.js'],
      [
        'Verify a file using a JWK',
        '$0 verify --jwk key.public.json signed.js',
      ],
      [
        'Verify a file using multiple JWKs',
        '$0 verify --jwk keyA.public.json  --jwk keyB.public.json signed.js',
      ],
      [
        'Verify a file using a JWK and insecure methods',
        '$0 verify --jwk key.public.json --insecure signed.js',
      ],
      ['Do not output to stdout/stderr', '$0 verify --quiet signed.js'],
    ],
  });

  jwkPath = Option.Array('-k,--jwk', []);
  insecure = Option.Boolean('--insecure', false);
  quiet = Option.String('-q,--quiet');

  async execute() {
    const input = await this._getInputStream();

    const verifiers: ContentVerifierIf[] = await Promise.all(
      this.jwkPath.map(async (jwkPath) => {
        const key = JSON.parse(await fs.readFile(jwkPath, 'utf-8')) as JWK;
        return new JWSContentVerifier({ key });
      }),
    );

    if (verifiers.length === 0 || this.insecure) {
      verifiers.push(DEFAULT_CONTENT_VERIFIER);
    }

    const analyzer = new StreamSourceAnalyzer({ verifiers });

    if (this.quiet) {
      try {
        await analyzer.assertIsValid(input);
        return 0;
      } catch {
        return 1;
      }
    } else {
      await analyzer.assertIsValid(input);
      this.context.stdout.write('Signature is valid.\n');
      return 0;
    }
  }
}
