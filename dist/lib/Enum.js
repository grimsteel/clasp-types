"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enum = void 0;
const Definition_1 = require("./Definition");
const EnumProperty_1 = require("./EnumProperty");
class Enum extends Definition_1.Definition {
    constructor(kind, depth) {
        super(kind, depth);
    }
    render(builder) {
        this.addComment(builder, this.kind.comment);
        let props = this.kind.children.map(k => new EnumProperty_1.EnumProperty(k, this.tab()));
        builder.append(`${this.ident()}export enum ${this.kind.name} {`).doubleLine();
        props.forEach(p => p.render(builder));
        builder.append(`${this.ident()}}`).doubleLine();
    }
}
exports.Enum = Enum;
