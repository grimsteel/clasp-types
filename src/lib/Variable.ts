import { DeclarationReflection } from "typedoc";
import { Definition } from "./Definition";
import { Builder } from "./builders/Builder";

export class Variable extends Definition<DeclarationReflection> {

  constructor(kind: DeclarationReflection, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);
    builder.append(`${this.ident()}`)
    builder.append('export ')
    if (this.kind.type) {
      builder.append(`let ${this.kind.name}: `);
      this.buildType(builder, this.kind.type)
      builder.append(`;`).doubleLine();
    }

  }
  
}