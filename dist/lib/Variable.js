"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
const Definition_1 = require("./Definition");
class Variable extends Definition_1.Definition {
    constructor(kind, depth) {
        super(kind, depth);
    }
    render(builder) {
        this.addComment(builder, this.kind.comment);
        builder.append(`${this.ident()}`);
        if (this.kind.flags.isExported) {
            builder.append('export ');
        }
        if (this.kind.type) {
            builder.append(`var ${this.kind.name}: `);
            this.buildType(builder, this.kind.type);
            builder.append(`;`).doubleLine();
        }
    }
}
exports.Variable = Variable;
