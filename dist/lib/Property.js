"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const Definition_1 = require("./Definition");
class Property extends Definition_1.Definition {
    constructor(kind, depth) {
        super(kind, depth);
    }
    render(builder) {
        this.addComment(builder, this.kind.comment);
        let sep = this.kind.flags.isOptional ? '?:' : ':';
        builder.append(`${this.ident()}${this.kind.name}${sep} `);
        if (this.kind.flags.isTypeof) {
            builder.append('typeof ');
        }
        if (this.kind.type) {
            this.buildType(builder, this.kind.type);
            builder.append(';').doubleLine();
        }
    }
}
exports.Property = Property;
