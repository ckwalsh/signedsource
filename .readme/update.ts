/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { access, readdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';
import { GENERATED_TOKEN, signSource } from '@ckwalsh/signedsource/full';

import devPkgsTyped from './dev-install.json' with { type: 'json' };
const devPkgs: Record<string, boolean> = devPkgsTyped as Record<string, boolean>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface PackageJsonStub {
  name: string;
  private?: boolean;
  description: string;
  bin?: Record<string, string>;
}

interface PackageInfo extends PackageJsonStub {
  root: string;
  partials: Record<string, string>;
}

interface RelatedPackageView {
  name: string;
  description: string;
  directory: string;
}

interface InstallerView {
  name: string;
  command: string;
  globalFlag: string;
  devFlag: string;
}

interface GlobalView {
  installers: InstallerView[];
  packages: RelatedPackageView[];
  examples: Record<string, unknown>;
  license: string;
  GENERATED_TOKEN: string;
}

interface View extends GlobalView {
  name: string;
  private: boolean;
  description: string;
  install: {
    global: boolean;
    dev: boolean;
  };
}

async function genPkgs(pkgsRoot: string): Promise<PackageInfo[]> {
  const pkgs: PackageInfo[] = [];
  const files = await readdir(pkgsRoot);

  await Promise.all(
    files
      .filter((name) => name !== '.' && name !== '..')
      .map(async (name) => {
        const root = path.join(pkgsRoot, name);

        const [stub, partials] = await Promise.all([
          import(path.join(root, 'package.json'), { with: { type: 'json' } }) as Promise<PackageJsonStub>,
          genPartialsForPkg(path.join(root, '.readme')),
        ]);
        const pkg: PackageInfo = {
          root,
          partials,
          ...stub,
        };

        pkgs.push(pkg);
      }),
  );

  return pkgs;
}

async function genPartialsForPkg(partialDir: string): Promise<Record<string, string>> {
  const partials: Record<string, string> = {
    'usage.md': '*No usage information available*',
  };
  let exists = true;
  try {
    await access(partialDir);
  } catch (_e) {
    exists = false;
  }
  if (!exists) {
    return partials;
  }
  const files = await readdir(partialDir);

  await Promise.all(
    files
      .filter((name) => name !== '.' && name !== '..')
      .map(async (name) => {
        partials[name] = await readFile(path.join(partialDir, name), 'utf-8');
      }),
  );

  return partials;
}

async function genExamples(exampleRoot: string): Promise<Record<string, unknown>> {
  const examples: Record<string, unknown> = {};
  const files = await readdir(exampleRoot);

  await Promise.all(
    files
      .filter((name) => name !== '.' && name !== '..')
      .map(async (name) => {
        const filePath = path.join(exampleRoot, name);
        const s = await stat(filePath);
        if (s.isDirectory()) {
          examples[name] = await genExamples(filePath);
        } else {
          let v: unknown = await readFile(filePath, 'utf-8');
          const nameParts: string[] = name.split('.').reverse();
          const k: string = nameParts.pop() ?? name;
          for (const part of nameParts) {
            v = { [part]: v };
          }
          examples[k] = v;
        }
      }),
  );

  return examples;
}

async function genGlobalView(pkgRoot: string, pkgs: PackageJsonStub[]): Promise<GlobalView> {
  const packages: RelatedPackageView[] = pkgs
    .filter((pkg) => !pkg.private)
    .map((pkg) => {
      const { name, description } = pkg;
      return {
        name,
        description,
        directory: `/packages/${name}`,
      };
    });

  packages.sort((a, b) => a.name.localeCompare(b.name));

  const [license, examples] = await Promise.all([
    genRenderedLicense(),
    genExamples(path.join(pkgRoot, 'examples', 'src')),
  ]);

  return {
    installers: [
      {
        name: 'npm',
        command: 'npm install',
        globalFlag: '--global',
        devFlag: '--save-dev',
      },
      {
        name: 'yarn',
        command: 'yarn add',
        globalFlag: '--global',
        devFlag: '--save-dev',
      },
      {
        name: 'pnpm',
        command: 'pnpm add',
        globalFlag: '--global',
        devFlag: '--save-dev',
      },
    ],
    packages,
    examples,
    license,
    GENERATED_TOKEN,
  };
}

function getPackageView(pkg: PackageJsonStub, globalView: GlobalView): View {
  const packages = globalView.packages.filter((p) => p.name !== pkg.name);

  return {
    name: pkg.name,
    private: !!pkg.private,
    description: pkg.description,
    install: {
      global: !!pkg.bin,
      dev: !!devPkgs[pkg.name],
    },
    ...globalView,
    packages,
  };
}

async function genRenderedLicense(): Promise<string> {
  const template = await readFile(path.join(__dirname, 'LICENSE.mustache'), 'utf-8');

  return Mustache.render(template, {
    currentYear: new Date().getFullYear(),
  });
}

async function main() {
  const workspaceRoot = path.join(__dirname, '..');

  const pkgsRoot = path.join(workspaceRoot, 'packages');
  const pkgs = await genPkgs(pkgsRoot);

  const globalView = await genGlobalView(pkgsRoot, pkgs);

  const template = await readFile(path.join(__dirname, 'README.md.mustache'), 'utf-8');

  await Promise.all(
    pkgs.map(async (pkg) => {
      const view = getPackageView(pkg, globalView);

      const rendered = Mustache.render(template, view, pkg.partials);
      const signed = signSource(rendered);

      await Promise.all([
        writeFile(path.join(pkg.root, 'LICENSE'), view.license, 'utf-8'),
        writeFile(path.join(pkg.root, 'README.md'), signed, 'utf-8'),
      ]);
    }),
  );

  // Write for workspace
  const rootTemplate = await readFile(path.join(__dirname, 'README-root.md.mustache'), 'utf-8');
  const rootRendered = Mustache.render(rootTemplate, globalView);
  const rootSigned = signSource(rootRendered);

  await Promise.all([
    writeFile(path.join(workspaceRoot, 'README.md'), rootSigned, 'utf-8'),
    writeFile(path.join(workspaceRoot, 'LICENSE'), globalView.license, 'utf-8'),
  ]);
}

void main();
