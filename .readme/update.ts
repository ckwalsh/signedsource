/*
 * Copyright (c) Cullen Walsh
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs/promises';
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
  author: string;
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
  installerName: string;
  command: string;
  globalFlag: string;
  devFlag: string;
}

interface GlobalView {
  installers: InstallerView[];
  packages: RelatedPackageView[];
  examples: Record<string, unknown>;
  LICENSE: string;
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

async function genPkgInfos(pkgsRoot: string): Promise<PackageInfo[]> {
  const files = await fs.readdir(pkgsRoot);

  return await Promise.all(
    files
      .filter((name) => name !== '.' && name !== '..')
      .map(async (name) => await genPkgInfo(path.join(pkgsRoot, name))),
  );
}

async function genPkgInfo(pkgRoot: string): Promise<PackageInfo> {
  const [rawPkg, partials] = await Promise.all([
    import(path.join(pkgRoot, 'package.json'), { with: { type: 'json' } }) as Promise<unknown>,
    genPartialsForPkg(path.join(pkgRoot, '.readme')),
  ]);

  return {
    ...(rawPkg as PackageJsonStub),
    root: pkgRoot,
    partials,
  };
}

async function genPartialsForPkg(partialDir: string): Promise<Record<string, string>> {
  const partials: Record<string, string> = {
    'usage.md': '*No usage information available*\n',
  };
  let exists = true;
  try {
    await fs.access(partialDir);
  } catch (_e) {
    exists = false;
  }
  if (!exists) {
    return partials;
  }
  const files = await fs.readdir(partialDir);

  await Promise.all(
    files
      .filter((name) => name !== '.' && name !== '..')
      .map(async (name) => {
        partials[name] = await fs.readFile(path.join(partialDir, name), 'utf-8');
      }),
  );

  return partials;
}

async function genExamples(exampleRoot: string): Promise<Record<string, unknown>> {
  const examples: Record<string, unknown> = {};
  const files = await fs.readdir(exampleRoot);

  await Promise.all(
    files
      .filter((name) => name !== '.' && name !== '..')
      .map(async (name) => {
        const filePath = path.join(exampleRoot, name);
        const s = await fs.stat(filePath);
        if (s.isDirectory()) {
          examples[name] = await genExamples(filePath);
        } else {
          let v: unknown = await fs.readFile(filePath, 'utf-8');
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

async function genGlobalView(rootPkg: PackageInfo, pkgs: PackageInfo[], examplesRoot: string): Promise<GlobalView> {
  const packages: RelatedPackageView[] = pkgs
    .filter((pkg) => !pkg.private)
    .map((pkg) => {
      const { name, description } = pkg;
      return {
        name,
        description,
        directory: `/packages/${path.basename(pkg.root)}`,
      };
    });

  packages.sort((a, b) => a.name.localeCompare(b.name));

  const [license, examples] = await Promise.all([genRenderedLicense(rootPkg.author), genExamples(examplesRoot)]);

  return {
    installers: [
      {
        installerName: 'npm',
        command: 'npm install',
        globalFlag: '--global',
        devFlag: '--save-dev',
      },
      {
        installerName: 'yarn',
        command: 'yarn add',
        globalFlag: '--global',
        devFlag: '--save-dev',
      },
      {
        installerName: 'pnpm',
        command: 'pnpm add',
        globalFlag: '--global',
        devFlag: '--save-dev',
      },
    ],
    packages,
    examples,
    LICENSE: license,
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

async function genRenderedLicense(author: string): Promise<string> {
  const template = await fs.readFile(path.join(__dirname, 'LICENSE.mustache'), 'utf-8');

  return Mustache.render(template, {
    currentYear: new Date().getFullYear(),
    author,
  });
}

async function main() {
  const workspaceRoot = path.join(__dirname, '..');
  const rootPkg = await genPkgInfo(workspaceRoot);

  const pkgsRoot = path.join(workspaceRoot, 'packages');
  const pkgs = await genPkgInfos(pkgsRoot);

  const globalView = await genGlobalView(rootPkg, pkgs, path.join(pkgsRoot, 'examples', 'src'));

  const template = await fs.readFile(path.join(__dirname, 'README.mustache'), 'utf-8');

  await Promise.all(
    pkgs.map(async (pkg) => {
      const view = getPackageView(pkg, globalView);

      const rendered = Mustache.render(template, view, pkg.partials);
      const signed = signSource(rendered);

      await Promise.all([
        fs.writeFile(path.join(pkg.root, 'LICENSE'), view.LICENSE, 'utf-8'),
        fs.writeFile(path.join(pkg.root, 'README.md'), signed, 'utf-8'),
      ]);
    }),
  );

  // Write for workspace
  const rootTemplate = await fs.readFile(path.join(__dirname, 'README-root.mustache'), 'utf-8');
  const rootView = getPackageView(rootPkg, globalView);
  //console.log(rootView);
  const rootRendered = Mustache.render(rootTemplate, rootView, rootPkg.partials);
  const rootSigned = signSource(rootRendered);

  await Promise.all([
    fs.writeFile(path.join(workspaceRoot, 'README.md'), rootSigned, 'utf-8'),
    fs.writeFile(path.join(workspaceRoot, 'LICENSE'), globalView.LICENSE, 'utf-8'),
  ]);
}

void main();
