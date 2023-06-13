import { Namespace } from "../Namespace";
import { Builder } from "./Builder";
import { PackageJson } from "../schemas/PackageJson";
import { Comment,  DeclarationReflection,  ProjectReflection,  ReferenceType,  ReflectionFlag,  ReflectionFlags,  ReflectionKind } from "typedoc";

export class LibraryBuilder extends Builder {

  rootKind: ProjectReflection;
  namespace: string;
  libraryName: string;
  packageJson: PackageJson;

  constructor(kind: ProjectReflection, namespace: string, libraryName: string, packageJson: PackageJson) {
    super();
    this.rootKind = kind;
    this.namespace = namespace;
    this.libraryName = libraryName;
    this.packageJson = packageJson;
  }

  build(): Builder {
    let rootNamespace = new Namespace(this.prepare(this.rootKind), 0);
    this.append(`// Type definitions for ${this.libraryName}`).line();
    this.append(`// Generated using clasp-types`).doubleLine();

    if (this.packageJson.dependencies) {
      for (let key in this.packageJson.dependencies) {
        key = key.replace('@types/', '');
        this.append(`/// <reference types="${key}" />`).doubleLine();
      }
    }

    rootNamespace.render(this);
    this.append(`declare const ${this.libraryName}: ${this.namespace}.${this.libraryName};`)
    return this;
  }

  /**
   * Prepare kind with library class from functions and enum
   */
  private prepare(kind: ProjectReflection): ProjectReflection {
    kind.kind = ReflectionKind.Module;
    kind.name = this.namespace;
    kind.children = kind.children || [];
    let functions = kind.children?.filter(kind => kind.flags.isPublic).filter(kind => kind.kind === ReflectionKind.Function) ?? [];
    let flags = new ReflectionFlags();
    flags.setFlag(ReflectionFlag.Public, true);
    let library= new DeclarationReflection(this.libraryName, ReflectionKind.Class);
    library.comment = new Comment([{ kind: "text", text: `The main entry point to interact with ${this.libraryName}` }]);
    library.children = functions;
    library.flags = flags;

    let enums = kind.children?.filter(kind => kind.flags.isPublic).filter(kind => kind.kind === ReflectionKind.Enum) ?? [];

    enums.forEach(e => {
      let property = new DeclarationReflection(e.name, ReflectionKind.Property);
      property.setFlag(ReflectionFlag.Public, true);
      property.setFlag(ReflectionFlag.Static, true);
      property.type = ReferenceType.createResolvedReference(e.name, property, kind);
      library.children!.unshift(property)
    });

    kind.children?.unshift(library);

    return kind;
  }
}
