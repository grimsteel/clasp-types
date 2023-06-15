import { Builder } from "./builders/Builder";
import { Interface } from "./Interface";
import { Variable } from "./Variable";
import { Enum } from "./Enum";
import { Definition } from "./Definition";
import { ContainerReflection, ReflectionKind } from "typedoc";

export class Namespace extends Definition {


  constructor(kind: ContainerReflection, depth: number) {
    super(kind, depth);
  }

  render(builder: Builder): void {
    this.kind.children = this.kind.children || [];
    let namespaces = this.kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kind === ReflectionKind.Module).map( kind => new Namespace(kind, this.tab()));
    let interfaces = this.kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kind === ReflectionKind.Class || kind.kind === ReflectionKind.Interface).map(kind => new Interface(kind, this.tab()));
    let enums = this.kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kind === ReflectionKind.Enum).map( kind => new Enum(kind, this.tab()));
    let variables = this.kind.children.filter(kind => kind.flags.isPublic).filter(kind => kind.kind === ReflectionKind.Variable).map( kind => new Variable(kind, this.tab(), true));
    builder.append(`${this.ident()}${this.depth === 0 ? "declare " : ""}namespace ${this.kind.name} {`).doubleLine()
    namespaces.forEach(n => n.render(builder))
    interfaces.forEach(i => i.render(builder))
    enums.forEach(e => e.render(builder))
    variables.forEach(e => e.render(builder))
    builder.append(`${this.ident()}}`).doubleLine();
  }

}