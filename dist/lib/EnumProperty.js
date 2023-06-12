"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumProperty = void 0;
const Definition_1 = require("./Definition");
class EnumProperty extends Definition_1.Definition {
    constructor(kind, depth) {
        super(kind, depth);
    }
    render(builder) {
        this.addComment(builder, this.kind.comment);
        builder.append(`${this.ident()}${this.kind.name} = ${this.kind.defaultValue},`).doubleLine();
    }
}
exports.EnumProperty = EnumProperty;
