import { Builder } from "./Builder";
import { Namespace } from "../Namespace";
import * as fs from "fs-extra";
import * as path from "path";
import { DeclarationReflection, IntrinsicType, ProjectReflection, ReflectionFlag, ReflectionKind } from "typedoc";

export class ClientSideBuilder extends Builder {

  rootKind: ProjectReflection;

  constructor(kind: ProjectReflection) {
    super();
    this.rootKind = kind;
  }

  build(): Builder {
    let rootNamespace = new Namespace(this.prepare(this.rootKind), 0);
    rootNamespace.render(this);
    return this;
  }

  /**
   * Prepare TypedocKind with functions
   */
  private prepare(kind: ProjectReflection): ProjectReflection {

    kind.kind = ReflectionKind.Module;
    kind.name = 'script';
    kind.setFlag(ReflectionFlag.Public, true);

    let children = kind.children?.filter(kind => kind.flags.isPublic).filter(kind => kind.kind === ReflectionKind.Function).map(f => {
      f.signatures = f.signatures?.map(s => {
        s.comment = undefined;
        s.type = new IntrinsicType(`void${f.signatures?.[0]?.type?.type ? ` //${f.signatures[0].type.type}` : ''}`);
        return s;
      });
      return f;
    }) || [];

    children.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withUserObject.json')).toString()));
    children.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withFailureHandler.json')).toString()));
    children.unshift(JSON.parse(fs.readFileSync(path.join(__dirname, 'withSuccessHandler.json')).toString()));


    let runner = new DeclarationReflection("Runner", ReflectionKind.Class);
    runner.children = children;
    runner.setFlag(ReflectionFlag.Public, true);

    let run = new DeclarationReflection("run", ReflectionKind.Variable);

    kind.children?.unshift(runner);
    kind.children?.push(run);

    let google = new ProjectReflection("google");
    google.kind = ReflectionKind.Module;
    google.children = [kind as unknown as DeclarationReflection];
    google.setFlag(ReflectionFlag.Public, true);
    return google;
  }

}
