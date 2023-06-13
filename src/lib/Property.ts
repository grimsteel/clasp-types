import {  DeclarationReflection } from "typedoc";
import { Definition } from "./Definition";
import { Builder } from "./builders/Builder";

export class Property extends Definition<DeclarationReflection> {
  constructor(kind: DeclarationReflection, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);
    let sep = this.kind.flags.isOptional ? '?:' : ':';

    builder.append(`${this.ident()}${this.kind.name}${sep} `)
    if (this.kind.type) {
      this.buildType(builder, this.kind.type)
      builder.append(';').doubleLine();
    }
  }

}