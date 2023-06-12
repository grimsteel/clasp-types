"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Namespace = void 0;
const Interface_1 = require("./Interface");
const Variable_1 = require("./Variable");
const Enum_1 = require("./Enum");
const Definition_1 = require("./Definition");
class Namespace extends Definition_1.Definition {
    constructor(kind, depth) {
        super(kind, depth);
    }
    render(builder) {
        let namespaces = this.kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kindString === 'Module').map(kind => new Namespace(kind, this.tab()));
        let interfaces = this.kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kindString === 'Class' || kind.kindString === 'Interface').map(kind => new Interface_1.Interface(kind, this.tab()));
        let enums = this.kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kindString === 'Enumeration').map(kind => new Enum_1.Enum(kind, this.tab()));
        let variables = this.kind.children.filter(kind => kind.flags.isPublic || kind.flags.isExported).filter(kind => kind.kindString === 'Variable').map(kind => new Variable_1.Variable(kind, this.tab()));
        builder.append(`${this.ident()}${this.depth === 0 ? "declare " : ""}namespace ${this.kind.name} {`).doubleLine();
        namespaces.forEach(n => n.render(builder));
        interfaces.forEach(i => i.render(builder));
        enums.forEach(e => e.render(builder));
        variables.forEach(e => e.render(builder));
        builder.append(`${this.ident()}}`).doubleLine();
    }
}
exports.Namespace = Namespace;
