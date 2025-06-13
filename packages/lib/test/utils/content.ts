/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ContentSignerIf, ContentVerifierIf } from '../../src/index.ts';
import {
  DEFAULT_CONTENT_VERIFIER,
  EMBEDDED_JWT_CONTENT_VERIFIER,
  JWSContentVerifier,
  LegacyContentSigner,
  createJWSContentSigner,
} from '../../src/index.ts';
import ed25519PrivateKey from './key.ed25519.json' with { type: 'json' };
import ed25519PublicKey from './key.ed25519.pub.json' with { type: 'json' };
import p256PrivateKey from './key.p256.json' with { type: 'json' };
import p256PublicKey from './key.p256.pub.json' with { type: 'json' };

const ed25519PrivateKeyVerifier = new JWSContentVerifier({
  key: ed25519PrivateKey,
});
const ed25519PublicKeyVerifier = new JWSContentVerifier({
  key: ed25519PublicKey,
});

const p256PrivateKeyVerifier = new JWSContentVerifier({
  key: p256PrivateKey,
});
const p256PublicKeyVerifier = new JWSContentVerifier({
  key: p256PublicKey,
});

interface InputContentSigner {
  name: string;
  signer: ContentSignerIf;
  verifiers: ContentVerifierIf[];
  deterministic: boolean;
}

let signersPromise: Promise<InputContentSigner[]> | null = null;

export function getContentSigners(): Promise<InputContentSigner[]> {
  signersPromise ??= (async (): Promise<InputContentSigner[]> => {
    const [ed25519, ed25519EmbedJWK, p256, p256EmbedJWK] = await Promise.all([
      createJWSContentSigner({ key: ed25519PrivateKey }),
      createJWSContentSigner({ key: ed25519PrivateKey, embedJWK: true }),
      createJWSContentSigner({ key: p256PrivateKey }),
      createJWSContentSigner({ key: p256PrivateKey, embedJWK: true }),
    ]);

    const ed25519Verifiers = [
      ed25519PrivateKeyVerifier,
      ed25519PublicKeyVerifier,
    ];

    const p256Verifiers = [p256PrivateKeyVerifier, p256PublicKeyVerifier];

    return [
      {
        name: 'LegacyContentSigner',
        signer: new LegacyContentSigner(),
        verifiers: [DEFAULT_CONTENT_VERIFIER],
        deterministic: true,
      },
      {
        name: 'JWSContentSigner (Ed25519)',
        signer: ed25519,
        verifiers: ed25519Verifiers,
        deterministic: false,
      },
      {
        name: 'JWSContentSigner (Ed25519, Embed JWK)',
        signer: ed25519EmbedJWK,
        verifiers: [...ed25519Verifiers, EMBEDDED_JWT_CONTENT_VERIFIER],
        deterministic: false,
      },
      {
        name: 'JWSContentSigner (P-256)',
        signer: p256,
        verifiers: p256Verifiers,
        deterministic: false,
      },
      {
        name: 'JWSContentSigner (P-256, Embed JWK)',
        signer: p256EmbedJWK,
        verifiers: [...p256Verifiers, EMBEDDED_JWT_CONTENT_VERIFIER],
        deterministic: false,
      },
    ];
  })();

  return signersPromise;
}

interface InputContentVerifier {
  name: string;
  verifier: ContentVerifierIf;
}

let verifiersPromise: Promise<InputContentVerifier[]> | null = null;

export function getContentVerifiers(): Promise<InputContentVerifier[]> {
  verifiersPromise ??= (async (): Promise<InputContentVerifier[]> => {
    const signers = await getContentSigners();

    return [
      {
        name: 'JWSContentVerifier (Ed25519, PrivKey)',
        verifier: ed25519PrivateKeyVerifier,
      },
      {
        name: 'JWSContentVerifier (Ed25519, PubKey)',
        verifier: ed25519PublicKeyVerifier,
      },
      {
        name: 'JWSContentVerifier (P-256, PrivKey)',
        verifier: p256PrivateKeyVerifier,
      },
      {
        name: 'JWSContentVerifier (P-256, PubKey)',
        verifier: p256PublicKeyVerifier,
      },
      ...signers.map(({ name, signer }) => ({ name, verifier: signer })),
    ];
  })();

  return verifiersPromise;
}
