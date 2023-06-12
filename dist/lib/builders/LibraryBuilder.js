"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryBuilder = void 0;
const Namespace_1 = require("../Namespace");
const Builder_1 = require("./Builder");
class LibraryBuilder extends Builder_1.Builder {
    rootKind;
    claspJson;
    packageJson;
    constructor(kind, claspJson, packageJson) {
        super();
        this.rootKind = kind;
        this.claspJson = claspJson;
        this.packageJson = packageJson;
    }
    build() {
        let rootNamespace = new Namespace_1.Namespace(this.prepare(this.rootKind), 0);
        this.append(`// Type definitions for ${this.claspJson.library.name}`).line();
        this.append(`// Generated using clasp-types`).doubleLine();
        if (this.packageJson.dependencies) {
            for (let key in this.packageJson.dependencies) {
                key = key.replace('@types/', '');
                console.log(key);
                this.append(`/// <reference types="${key}" />`).doubleLine();
            }
        }
        rootNamespace.render(this);
        this.append(`declare var ${this.claspJson.library.name}: ${this.claspJson.library.namespace}.${this.claspJson.library.name};`);
        return this;
    }
    /**
     * Prepare kind with library class from functions and enum
     */
    prepare(kind) {
        kind.kindString = 'Module';
        kind.flags.isPublic = true;
        kind.name = this.claspJson.library.namespace;
        let functions = kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kindString === 'Function');
        let library = {
            name: this.claspJson.library.name,
            comment: {
                shortText: `The main entry point to interact with ${this.claspJson.library.name}`,
                text: `Script ID: **${this.claspJson.scriptId}**`
            },
            kindString: 'Class',
            children: functions,
            flags: {
                isPublic: true
            },
            signatures: []
        };
        let enums = kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kindString === 'Enumeration');
        enums.forEach(e => {
            let property = {
                name: e.name,
                kindString: "Property",
                flags: {
                    isPublic: true,
                    isTypeof: true
                },
                type: {
                    type: "reference",
                    name: e.name,
                },
                children: [],
                signatures: [],
            };
            library.children.unshift(property);
        });
        kind.children.unshift(library);
        return kind;
    }
}
exports.LibraryBuilder = LibraryBuilder;
