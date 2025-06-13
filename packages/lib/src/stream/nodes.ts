/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SourceType } from '../types/impl/analyzer.ts';

interface NodeBase {
  type: Node['type'];
  signedData?: string;
  unsignedData?: string;
  signature?: boolean;
}

interface SignedDataNode extends NodeBase {
  signedData: string;
  unsignedData?: never;
  signature?: never;
}

interface UnsignedDataNode extends NodeBase {
  signedData?: never;
  unsignedData: string;
  signature?: never;
}

interface SignatureTokenNode extends NodeBase {
  signedData?: never;
  unsignedData: string;
  signature: true;
}

interface ContextNode extends NodeBase {
  signedData?: never;
  unsignedData?: never;
}

interface SignedSourceType extends ContextNode {
  type: 'SignedSourceType';
  sourceType: SourceType;
}

interface SignedSource extends SignedDataNode {
  type: 'SignedSource';
}

interface ManualSectionStart extends SignedDataNode {
  type: 'ManualSectionStart';
}

interface ManualSectionIdData extends SignedDataNode {
  type: 'ManualSectionIdData';
}

interface ManualSectionContentStart extends ContextNode {
  type: 'ManualSectionContentStart';
}

interface ManualSectionContentData extends UnsignedDataNode {
  type: 'ManualSectionContentData';
}

interface ManualSectionEnd extends SignedDataNode {
  type: 'ManualSectionEnd';
}

interface SignedSignatureTokenStart extends SignatureTokenNode {
  type: 'SignedSignatureTokenStart';
}

interface UnsignedSignatureTokenStart extends SignatureTokenNode {
  type: 'UnsignedSignatureTokenStart';
}

interface SignatureData extends SignatureTokenNode {
  type: 'SignatureData';
}

interface SignatureTokenEnd extends SignatureTokenNode {
  type: 'SignatureTokenEnd';
}

export type Node =
  | SignedSourceType
  | SignedSource
  | ManualSectionStart
  | ManualSectionIdData
  | ManualSectionContentStart
  | ManualSectionContentData
  | ManualSectionEnd
  | SignedSignatureTokenStart
  | UnsignedSignatureTokenStart
  | SignatureData
  | SignatureTokenEnd;
