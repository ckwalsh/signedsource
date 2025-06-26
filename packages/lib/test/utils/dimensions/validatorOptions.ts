/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSecretKey } from 'node:crypto';

import type { SignedSourceValidatorDefaultOptions } from '../../../src/index.ts';
import {
  EmbeddedJwtJwsSignedContentValidator,
  JwsSignedContentValidator,
  MD5SignedContentSignerValidator,
} from '../../../src/index.ts';
import ed25519PrivateKey from '../key.ed25519.json' with { type: 'json' };
import ed25519PublicKey from '../key.ed25519.pub.json' with { type: 'json' };
import p256PrivateKey from '../key.p256.json' with { type: 'json' };
import p256PublicKey from '../key.p256.pub.json' with { type: 'json' };

export type ValidatorDefaultOptionsTestCaseKey =
  | 'default'
  | 'md5'
  | 'embedded jwk'
  | 'ed25519 pubkey'
  | 'ed25519 privkey'
  | 'p256 pubkey'
  | 'p256 privkey'
  | 'symmetric';

interface ValidatorDefaultOptionsTestCase {
  validatorOptionsKey: ValidatorDefaultOptionsTestCaseKey;
  validatorOptions: SignedSourceValidatorDefaultOptions;
}

const TEST_CASE_MAP: Record<
  ValidatorDefaultOptionsTestCaseKey,
  ValidatorDefaultOptionsTestCase
> = {
  'default': { validatorOptionsKey: 'default', validatorOptions: {} },
  'md5': {
    validatorOptionsKey: 'md5',
    validatorOptions: {
      validator: new MD5SignedContentSignerValidator(),
    },
  },
  'embedded jwk': {
    validatorOptionsKey: 'embedded jwk',
    validatorOptions: {
      validator: new EmbeddedJwtJwsSignedContentValidator(),
    },
  },
  'ed25519 pubkey': {
    validatorOptionsKey: 'ed25519 pubkey',
    validatorOptions: {
      validator: new JwsSignedContentValidator({
        key: ed25519PublicKey,
      }),
    },
  },
  'ed25519 privkey': {
    validatorOptionsKey: 'ed25519 privkey',
    validatorOptions: {
      validator: new JwsSignedContentValidator({
        key: ed25519PrivateKey,
      }),
    },
  },
  'p256 pubkey': {
    validatorOptionsKey: 'p256 pubkey',
    validatorOptions: {
      validator: new JwsSignedContentValidator({
        key: p256PublicKey,
      }),
    },
  },
  'p256 privkey': {
    validatorOptionsKey: 'p256 privkey',
    validatorOptions: {
      validator: new JwsSignedContentValidator({
        key: p256PrivateKey,
      }),
    },
  },
  'symmetric': {
    validatorOptionsKey: 'symmetric',
    validatorOptions: {
      validator: new JwsSignedContentValidator({
        key: createSecretKey('secret', 'utf-8'),
      }),
    },
  },
};

for (const [key, value] of Object.entries(TEST_CASE_MAP)) {
  if (value.validatorOptionsKey !== key) {
    throw new Error(
      `Validator Options test case label mismatch: expected ${key}, got ${value.validatorOptionsKey}`,
    );
  }
}

export const VALIDATOR_OPTIONS_TEST_CASES: ValidatorDefaultOptionsTestCase[] =
  Object.entries(TEST_CASE_MAP).map((entry) => entry[1]);
