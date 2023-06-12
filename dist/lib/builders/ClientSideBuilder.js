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
exports.ClientSideBuilder = void 0;
const Builder_1 = require("./Builder");
const Namespace_1 = require("../Namespace");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class ClientSideBuilder extends Builder_1.Builder {
    rootKind;
    constructor(kind) {
        super();
        this.rootKind = kind;
    }
    build() {
        let rootNamespace = new Namespace_1.Namespace(this.prepare(this.rootKind), 0);
        rootNamespace.render(this);
        return this;
    }
    /**
     * Prepare TypedocKind with functions
     */
    prepare(kind) {
        kind.kindString = 'Module';
        kind.flags.isPublic = true;
        kind.name = 'script';
        let children = kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kindString === 'Function').map(f => {
            return {
                ...f,
                signatures: [
                    {
                        ...f.signatures[0],
                        comment: undefined,
                        type: {
                            type: "intrinsic",
                            name: `void${f.signatures[0].type.name ? ` //${f.signatures[0].type.name}` : ''}`
                        }
                    }
                ],
            };
        });
        children.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withUserObject.json')).toString()));
        children.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withFailureHandler.json')).toString()));
        children.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withSuccessHandler.json')).toString()));
        let runner = {
            name: 'Runner',
            kindString: 'Class',
            children: children,
            flags: {
                isPublic: true
            },
            signatures: []
        };
        let run = {
            "name": "run",
            "kindString": "Variable",
            "flags": {
                "isExported": true
            },
            "type": {
                "type": "reference",
                "name": "Runner"
            },
            children: [],
            signatures: []
        };
        kind.children.unshift(runner);
        kind.children.push(run);
        return {
            name: 'google',
            kindString: "Module",
            children: [kind],
            flags: {
                isPublic: true
            },
            signatures: []
        };
    }
}
exports.ClientSideBuilder = ClientSideBuilder;
