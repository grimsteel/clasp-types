"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
const Definition_1 = require("./Definition");
class Method extends Definition_1.Definition {
    constructor(kind, depth) {
        super(kind, depth);
    }
    render(builder) {
        let signature = this.kind.signatures[0];
        this.addComment(builder, signature.comment);
        builder.append(`${this.ident()}${this.kind.name}(`);
        this.buildParams(builder, signature.parameters);
        builder.append('): ');
        this.buildType(builder, signature.type);
        builder.append(';').doubleLine();
    }
}
exports.Method = Method;
