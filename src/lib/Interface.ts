import { ContainerReflection, ReflectionKind } from "typedoc";
import { Builder } from "./builders/Builder";
import { Definition } from "./Definition";
import { Method } from "./Method";
import { Property } from "./Property";

export class Interface extends Definition {

  constructor(kind: ContainerReflection, depth: number) {
    super(kind, depth);
  }
  
  render(builder: Builder): void {
    this.kind.children = this.kind.children || [];
    let methods = this.kind.children.filter(k => this.kind.kind === ReflectionKind.Interface ? true : k.flags.isPublic).filter(k => k.kind === ReflectionKind.Method || k.kind === ReflectionKind.Function).map(k => new Method(k, this.tab()));
    let properties = this.kind.children.filter(k => this.kind.kind === ReflectionKind.Interface ? true : k.flags.isPublic).filter(k => k.kind === ReflectionKind.Property).map(k => new Property(k, this.tab()));
    this.addComment(builder, this.kind.comment);
    if (methods.length > 0 || properties.length > 0) {
      builder.append(`${this.ident()}export interface ${this.kind.name} {`).doubleLine()
      properties.forEach(p => p.render(builder))
      methods.forEach(m => m.render(builder))
      builder.append(`${this.ident()}}`).doubleLine();
    }
  }

}