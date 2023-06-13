#!/usr/bin/env node

import { program } from "commander";
import * as TypeDoc from 'typedoc';
import * as fs from "fs-extra";
import { LibraryBuilder } from "./lib/builders/LibraryBuilder";
import { ClientSideBuilder } from "./lib/builders/ClientSideBuilder";
import { ReadmeBuilder } from "./lib/builders/ReadmeBuilder";
import { LicenseBuilder } from "./lib/builders/LicenseBuilder";
import { PackageJson } from './lib/schemas/PackageJson';

const typedocApp = new TypeDoc.Application();
typedocApp.options.addReader(new TypeDoc.TSConfigReader());
typedocApp.options.addReader(new TypeDoc.TypeDocReader());

program
  .description("Generate d.ts for clasp projects. File [.clasp.json] required")
  .option('-s, --src <file>', 'Source file name', 'Code.ts')
  .option('-o, --out <folder>', 'Output folder', 'dist')
  .option('-g, --client', 'Generate client side API types', false)
  .option('-r, --root <folder>', 'Root folder of [package.json] file', '.')
  .option("-n, --name <name>", "Library name")
  .option("-p, --namespace <namespace>", "Library namespace")
  .parse(process.argv);


const opts = program.opts();
let rootDir: string = opts.root;
let srcFile: string = `${rootDir}/${opts.src}`;
let outDir: string = `${rootDir}/${opts.out}`;
let gsRun: boolean = opts.client;
let filename = 'index.d.ts';

//Load package.json
const packageJsonPath = `${rootDir}/package.json`;
let packageJson: PackageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
} catch (error) {
  console.log(`${packageJsonPath} NOT found!`)
  process.exit(1);
}

(async () => {
  await typedocApp.bootstrapWithPlugins({
    entryPoints: [srcFile],
    plugin: ["@zamiell/typedoc-plugin-not-exported"],
    // @ts-ignore
    includeTag: "public"
  });

  const project = typedocApp.convert();

  if (project) {
    if (gsRun) {
      getGSRunTypes(project);
    } else {
      generateLibraryTypes(project);
    }
  } else {
    console.log('Error reading .ts source files')
    process.exit(1);
  }
})();

function generateLibraryTypes(rootTypedoKind: TypeDoc.ProjectReflection) {
  if (!opts.name || !opts.namespace) {
    console.log('ERROR - Provide library name and namespace with -n and -p options');
    console.log();
    console.log('...or run with --client option to generate google.script.run d.ts files');
    return;
  }

  if (opts.namespace === opts.name) {
    console.log('ERROR - Library name and namespace must be different');
    return;
  }

  packageJson.name = `${packageJson.name}-types`;
  packageJson.description = `Typescript definitions for ${opts.name}`;
  packageJson.scripts = {};
  packageJson.devDependencies = {};
  packageJson.license = 'MIT';

  packageJson.types = `./${filename}`;
  fs.outputFileSync(`${outDir}/${packageJson.name}/package.json`, JSON.stringify(packageJson, null, 2));

  //README.md
  let readmeBuilder = new ReadmeBuilder(packageJson, opts.namespace);
  fs.outputFileSync(`${outDir}/${packageJson.name}/README.md`, readmeBuilder.build().getText());

  //LICENSE
  let licenseBuilder = new LicenseBuilder(packageJson);
  fs.outputFileSync(`${outDir}/${packageJson.name}/LICENSE`, licenseBuilder.build().getText());

  //Library
  let builder = new LibraryBuilder(rootTypedoKind, opts.namespace, opts.name, packageJson);
  const filepath = `${outDir}/${packageJson.name}/${filename}`;
  fs.outputFileSync(filepath, builder.build().getText());

  console.log(`Generated ${opts.name} definitions at ${outDir}/`);
}

/**
 * Generate google.script.run d.ts file
 */
function getGSRunTypes(rootTypedoKind: TypeDoc.ProjectReflection) {
  let builder = new ClientSideBuilder(rootTypedoKind);
  const filepath = `${outDir}/@types/google.script.types/${filename}`;
  fs.outputFileSync(filepath, builder.build().getText());
  console.log(`Generated google.script.types definitions at ${outDir}/@types/`);
}

