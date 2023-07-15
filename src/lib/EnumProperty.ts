import { ContainerReflection } from "typedoc";
import { Definition } from "./Definition";
import { Builder } from "./builders/Builder";

export class EnumProperty extends Definition {

  constructor(kind: ContainerReflection, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.addComment(builder, this.kind.comment);
    if (this.kind.anchor)
      builder.append(`${this.ident()}${this.kind.name} = ${this.kind.anchor},`).doubleLine()
    else
      builder.append(`${this.ident()}${this.kind.name},`).doubleLine()
  }
  
}