import { DeclarationReflection } from "typedoc";
import { Definition } from "./Definition";
import { Builder } from "./builders/Builder";

export class Variable extends Definition<DeclarationReflection> {

  useAssignmentStyle: boolean;

  constructor(kind: DeclarationReflection, depth: number, useAssignmentStyle = false) {
    super(kind, depth);
    this.useAssignmentStyle = useAssignmentStyle;
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);
    builder.append(`${this.ident()}`)
    if (this.kind.type) {
      if (this.useAssignmentStyle) builder.append(`export const ${this.kind.name}: `);
      else builder.append(`${this.kind.name}: `);
      this.buildType(builder, this.kind.type)
      builder.append(`;`).doubleLine();
    }

  }
  
}