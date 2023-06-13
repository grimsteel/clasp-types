import { DeclarationReflection } from "typedoc";
import { Definition } from "./Definition";
import { Builder } from "./builders/Builder";

export class Method extends Definition<DeclarationReflection> {

  constructor(kind: DeclarationReflection, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    let signature = this.kind.signatures?.[0];
    this.addComment(builder, signature?.comment);
    builder.append(`${this.ident()}${this.kind.name}(`);

    this.buildParams(builder, signature?.parameters || []);
    builder.append('): ');
    this.buildType(builder, signature?.type);
    builder.append(';').doubleLine()
  }
}