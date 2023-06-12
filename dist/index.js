#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require('commander');
const TypeDoc = __importStar(require("typedoc"));
const fs = __importStar(require("fs-extra"));
const LibraryBuilder_1 = require("./lib/builders/LibraryBuilder");
const ClientSideBuilder_1 = require("./lib/builders/ClientSideBuilder");
const ReadmeBuilder_1 = require("./lib/builders/ReadmeBuilder");
const LicenseBuilder_1 = require("./lib/builders/LicenseBuilder");
const typedocApp = new TypeDoc.Application();
typedocApp.options.addReader(new TypeDoc.TSConfigReader());
typedocApp.options.addReader(new TypeDoc.TypeDocReader());
program
    .description("Generate d.ts for clasp projects. File [.clasp.json] required")
    .option('-s, --src <folder>', 'Source folder', 'src')
    .option('-o, --out <folder>', 'Output folder', 'dist')
    .option('-g, --client', 'Generate client side API types', false)
    .option('-r, --root <folder>', 'Root folder of [.clasp.json] and [package.json] files', '.')
    .parse(process.argv);
let rootDir = program.root;
let srcDir = `${rootDir}/${program.src}`;
let outDir = `${rootDir}/${program.out}`;
let gsRun = program.client;
let filename = 'index.d.ts';
typedocApp.bootstrap({
    logLevel: "None",
    excludeExternals: true,
    entryPoints: [srcDir],
    entryPointStrategy: "expand"
});
//Load .clasp.json
const claspJsonPath = `${rootDir}/.clasp.json`;
let claspJson;
try {
    claspJson = JSON.parse(fs.readFileSync(claspJsonPath).toString());
}
catch (error) {
    console.log(`${claspJsonPath} NOT found!`);
    process.exit(1);
}
//Load package.json
const packageJsonPath = `${rootDir}/package.json`;
let packageJson;
try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
}
catch (error) {
    console.log(`${packageJsonPath} NOT found!`);
    process.exit(1);
}
const project = typedocApp.convert();
if (project) {
    const apiModelFilePath = `${outDir}/.clasp-types-temp-api-model__.json`;
    try {
        //Generate api model
        typedocApp.generateJson(project, apiModelFilePath);
        //Generate types
        let rawdata = fs.readFileSync(apiModelFilePath);
        let rootTypedoKind = JSON.parse(rawdata.toString());
        if (gsRun) {
            getGSRunTypes(rootTypedoKind);
        }
        else {
            generateLibraryTypes(rootTypedoKind);
        }
    }
    finally {
        //Tear down
        fs.remove(apiModelFilePath);
    }
}
else {
    console.log('Error reading .ts source files');
    process.exit(1);
}
function generateLibraryTypes(rootTypedoKind) {
    if (!claspJson.library || !claspJson.library.name || !claspJson.library.namespace) {
        console.log('ERROR - Add library info to .clasp.json. Example:');
        console.log();
        console.log(JSON.stringify({
            "scriptId": "xxxx",
            "rootDir": "./src",
            "library": {
                "namespace": "bkper",
                "name": "BkperApp"
            }
        }, null, 2));
        console.log();
        console.log('...or run with --client option to generate google.script.run d.ts files');
        console.log();
        return;
    }
    packageJson.name = `${packageJson.name}-types`;
    packageJson.description = `Typescript definitions for ${claspJson.library.name}`;
    packageJson.scripts = {};
    packageJson.devDependencies = {};
    packageJson.license = 'MIT';
    if (packageJson.dependencies) {
        for (let key in packageJson.dependencies) {
            packageJson.dependencies[key] = '*';
        }
    }
    packageJson.types = `./${filename}`;
    fs.outputFileSync(`${outDir}/${packageJson.name}/package.json`, JSON.stringify(packageJson, null, 2));
    //README.md
    let readmeBuilder = new ReadmeBuilder_1.ReadmeBuilder(packageJson, claspJson);
    fs.outputFileSync(`${outDir}/${packageJson.name}/README.md`, readmeBuilder.build().getText());
    //LICENSE
    let licenseBuilder = new LicenseBuilder_1.LicenseBuilder(packageJson);
    fs.outputFileSync(`${outDir}/${packageJson.name}/LICENSE`, licenseBuilder.build().getText());
    //Library
    let builder = new LibraryBuilder_1.LibraryBuilder(rootTypedoKind, claspJson, packageJson);
    const filepath = `${outDir}/${packageJson.name}/${filename}`;
    fs.outputFileSync(filepath, builder.build().getText());
    console.log(`Generated ${claspJson.library.name} definitions at ${outDir}/`);
}
/**
 * Generate google.script.run d.ts file
 */
function getGSRunTypes(rootTypedoKind) {
    let builder = new ClientSideBuilder_1.ClientSideBuilder(rootTypedoKind);
    const filepath = `${outDir}/@types/google.script.types/${filename}`;
    fs.outputFileSync(filepath, builder.build().getText());
    console.log(`Generated google.script.types definitions at ${outDir}/@types/`);
}
