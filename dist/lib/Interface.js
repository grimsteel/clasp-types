"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interface = void 0;
const Definition_1 = require("./Definition");
const Method_1 = require("./Method");
const Property_1 = require("./Property");
class Interface extends Definition_1.Definition {
    constructor(kind, depth) {
        super(kind, depth);
    }
    render(builder) {
        let methods = this.kind.children.filter(k => this.kind.kindString === 'Interface' ? true : k.flags.isPublic).filter(k => k.kindString === 'Method' || k.kindString === 'Function').map(k => new Method_1.Method(k, this.tab()));
        let properties = this.kind.children.filter(k => this.kind.kindString === 'Interface' ? true : k.flags.isPublic).filter(k => k.kindString === 'Property').map(k => new Property_1.Property(k, this.tab()));
        this.addComment(builder, this.kind.comment);
        if (methods.length > 0 || properties.length > 0) {
            builder.append(`${this.ident()}export interface ${this.kind.name} {`).doubleLine();
            properties.forEach(p => p.render(builder));
            methods.forEach(m => m.render(builder));
            builder.append(`${this.ident()}}`).doubleLine();
        }
    }
}
exports.Interface = Interface;
