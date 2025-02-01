#!/usr/bin/env node

import { signCode, verifyCode } from '../index.js';
import fs from 'fs';

const args = process.argv.slice(2);
args.reverse();

const action = args.pop();
switch (action) {
  case 'sign':
  case 'verify':
    break;
  default:
    if (action === undefined) {
      console.error('No action provided');
    } else {
      console.error(`Unknown action: ${action}`);
    }

    process.exit(1);
}

let force = false;
let file = args.pop();

if (file === '-f') {
  force = true;
  file = args.pop();
}

if (file === undefined) {
  console.error('No file provided');
  process.exit(1);
}

const data = fs.readFileSync(file, 'utf8');
if (data === undefined) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

if (action === 'sign') {
  let signedData;
  try {
    signedData = signCode(data, undefined, force);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  fs.writeFileSync(file, signedData, 'utf8');
} else if (action === 'verify') {
  if (verifyCode(data)) {
    console.log('Signature is valid');
    process.exit(0);
  } else {
    console.error('Signature is invalid');
    process.exit(1);
  }
}
