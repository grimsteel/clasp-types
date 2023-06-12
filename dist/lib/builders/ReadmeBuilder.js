"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmeBuilder = void 0;
const Builder_1 = require("./Builder");
class ReadmeBuilder extends Builder_1.Builder {
    packageJson;
    claspJson;
    constructor(packageJson, claspJson) {
        super();
        this.packageJson = packageJson;
        this.claspJson = claspJson;
    }
    build() {
        let org = this.extractOrg();
        this
            .append("# Summary").doubleLine()
            .append(`This package contains Typescript definitions for [${this.claspJson.library.name}](${this.extractHomepage()})`).doubleLine()
            .append("# Instalation").doubleLine()
            .append('### 1) Add the package:').doubleLine()
            .append('```').line()
            .append(`npm i -S ${this.packageJson.name}`).line()
            .append('```').line()
            .append('or').line()
            .append('```').line()
            .append(`yarn add --dev ${this.packageJson.name}`).line()
            .append('```').doubleLine()
            .append(`### 2) Configure tsconfig.json:`).doubleLine()
            .append('```').line()
            .append('{').line()
            .append('    "compilerOptions": {').line();
        if (org) {
            this.append(`        "typeRoots" : ["node_modules/${org}", "node_modules/@types" ]`).line();
        }
        else {
            this.append(`        "types" : ["${this.packageJson.name}", "google-apps-script"]`).line();
        }
        this.append('    }').line()
            .append('}').line()
            .append('```').doubleLine()
            .append('[Learn more](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types) about **@types**, **typeRoots** and **types**').doubleLine();
        this.append('# Details').doubleLine()
            .append(`Generated using [clasp-types](https://github.com/maelcaldas/clasp-types)`).doubleLine();
        return this;
    }
    extractOrg() {
        if (this.packageJson.name.startsWith('@')) {
            return this.packageJson.name.split('/')[0];
        }
        return null;
    }
    extractHomepage() {
        if (this.packageJson.homepage) {
            return this.packageJson.homepage;
        }
        if (this.packageJson.repository) {
            if (typeof this.packageJson.repository === 'string') {
                return this.packageJson.repository;
            }
            else {
                return this.packageJson.repository.url.replace('\\.git', '');
            }
        }
        return 'https://developers.google.com/apps-script/guides/libraries';
    }
}
exports.ReadmeBuilder = ReadmeBuilder;
