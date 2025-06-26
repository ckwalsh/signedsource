/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  SignedContentSignerIf,
  SignedSourceSignerDefaultOptions,
  SignedSourceSignerIf,
  SignedSourceSignerOptions,
} from '../../api/sign.ts';
import { DefaultSignedContentSigner } from '../../signatures/index.ts';
import type { SignTransformerOptions } from '../../stream/sign.ts';
import { SignTransformer } from '../../stream/sign.ts';
import { UnsignTransformer } from '../../stream/unsign.ts';
import { SignedSourceValidatorBase } from './validate.ts';

const IS_PRODUCTION = process.env['NODE_ENV'] === 'production';

export abstract class SignedSourceSignerBase<
    TSource,
    TResult = Promise<TSource>,
  >
  extends SignedSourceValidatorBase<TSource>
  implements SignedSourceSignerIf<TSource, TResult>
{
  protected readonly _signer: SignedContentSignerIf;

  constructor(options: SignedSourceSignerDefaultOptions = {}) {
    const sourceType = options.sourceType;
    const signer = options.signer ?? new DefaultSignedContentSigner();

    super({ sourceType, validator: signer });

    this._signer = signer;
  }

  sign(
    source: TSource,
    options: Partial<SignedSourceSignerOptions> = {},
  ): TResult {
    const stream = this._toSignedStream(source, options);

    return this._streamToResult(stream);
  }

  unsign(
    source: TSource,
    options: Partial<SignedSourceSignerOptions> = {},
  ): TResult {
    const stream = this._toUnsignedStream(source, options);

    return this._streamToResult(stream);
  }

  /** @internal **/
  protected _toSignedStream(
    source: TSource,
    options: Partial<SignedSourceSignerOptions>,
  ): ReadableStream<string> {
    const signTransformerOptions: SignTransformerOptions = {
      signer: this._signer,
      ...options,
    };

    if (!IS_PRODUCTION) {
      signTransformerOptions.__hasherFnForTesting = this.__hasherFnForTesting;
    }

    return this._toTokenStream(source, options).pipeThrough(
      new TransformStream(new SignTransformer(signTransformerOptions)),
    );
  }

  /** @internal **/
  protected _toUnsignedStream(
    source: TSource,
    options: Partial<SignedSourceSignerOptions>,
  ): ReadableStream<string> {
    return this._toTokenStream(source, options).pipeThrough(
      new TransformStream(
        new UnsignTransformer({
          signer: this._signer,
          ...options,
        }),
      ),
    );
  }

  /** @internal **/
  protected abstract _streamToResult(stream: ReadableStream<string>): TResult;
}
