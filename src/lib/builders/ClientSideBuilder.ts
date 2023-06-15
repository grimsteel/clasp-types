import { Builder } from "./Builder";
import { Namespace } from "../Namespace";
import * as fs from "fs-extra";
import * as path from "path";
import { DeclarationReflection, IntrinsicType, ParameterReflection, ProjectReflection, ReferenceType, ReflectionFlag, ReflectionKind, ReflectionType, SignatureReflection } from "typedoc";

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
    const script = new DeclarationReflection("script", ReflectionKind.Module);
    script.setFlag(ReflectionFlag.Public, true);

    let publicFunctions: DeclarationReflection[] = [];
    let otherChildren: DeclarationReflection[] = [];

    kind.children?.forEach(child => {
      if (child.flags.isPublic && child.kind === ReflectionKind.Function) {
        child.signatures = child.signatures?.map(s => {
          s.comment = undefined;
          s.type = new IntrinsicType(`void${child.signatures?.[0]?.type?.type ? ` //${child.signatures[0].type.type}` : ''}`);
          return s;
        });
        publicFunctions.push(child);
      } else {
        otherChildren.push(child);
      }
    });

    const withUserObject = new DeclarationReflection("withUserObject", ReflectionKind.Method);
    const wuoCallSig = new SignatureReflection("withUserObject", ReflectionKind.CallSignature, withUserObject);
    const wuoParam1 = new ParameterReflection("object", ReflectionKind.Parameter, wuoCallSig);
    wuoParam1.type = new IntrinsicType("any");
    wuoCallSig.parameters = [wuoParam1];
    wuoCallSig.type = ReferenceType.createResolvedReference("Runner", wuoCallSig, kind);
    withUserObject.setFlag(ReflectionFlag.Public, true);
    withUserObject.signatures = [wuoCallSig];

    const withFailureHandler = new DeclarationReflection("withFailureHandler", ReflectionKind.Method);
    const wfhCallSig = new SignatureReflection("withFailureHandler", ReflectionKind.CallSignature, withUserObject);
    const wfhParam1 = new ParameterReflection("handler", ReflectionKind.Parameter, wfhCallSig);
    const wfhParam1Ref = new DeclarationReflection("__type", ReflectionKind.TypeLiteral);
    const wfhParam1RefCallSig = new SignatureReflection("__call", ReflectionKind.CallSignature, wfhParam1Ref);
    const wfhParam1RefCallSigParam1 = new ParameterReflection("error", ReflectionKind.Parameter, wfhParam1RefCallSig);
    wfhParam1RefCallSigParam1.type = ReferenceType.createResolvedReference("Error", wfhParam1RefCallSigParam1, kind);
    wfhParam1RefCallSig.parameters = [wfhParam1RefCallSigParam1];
    wfhParam1RefCallSig.type = new IntrinsicType("void");
    wfhParam1Ref.signatures = [wfhParam1RefCallSig];
    wfhParam1.type = new ReflectionType(wfhParam1Ref);
    wfhCallSig.parameters = [wfhParam1];
    wfhCallSig.type = ReferenceType.createResolvedReference("Runner", wfhCallSig, kind);
    withFailureHandler.setFlag(ReflectionFlag.Public, true);
    withFailureHandler.signatures = [wfhCallSig];

    const withSuccessHandler = new DeclarationReflection("withSuccessHandler", ReflectionKind.Method);
    const wshCallSig = new SignatureReflection("withSuccessHandler", ReflectionKind.CallSignature, withUserObject);
    const wshParam1 = new ParameterReflection("handler", ReflectionKind.Parameter, wshCallSig);
    const wshParam1Ref = new DeclarationReflection("__type", ReflectionKind.TypeLiteral);
    const wshParam1RefCallSig = new SignatureReflection("__call", ReflectionKind.CallSignature, wshParam1Ref);
    const wshParam1RefCallSigParam1 = new ParameterReflection("response", ReflectionKind.Parameter, wshParam1RefCallSig);
    wshParam1RefCallSigParam1.type = new IntrinsicType("any"); // callback param 1 type
    wshParam1RefCallSig.type = new IntrinsicType("void"); // callback return type
    wshParam1RefCallSig.parameters = [wshParam1RefCallSigParam1];
    wshParam1Ref.signatures = [wshParam1RefCallSig];
    wshParam1.type = new ReflectionType(wshParam1Ref); // callback type
    wshCallSig.parameters = [wshParam1];
    // Make the return type reference Runner
    wshCallSig.type = ReferenceType.createResolvedReference("Runner", wshCallSig, kind);
    withSuccessHandler.setFlag(ReflectionFlag.Public, true);
    withSuccessHandler.signatures = [wshCallSig];

    publicFunctions.unshift(withUserObject);
    publicFunctions.unshift(withFailureHandler);
    publicFunctions.unshift(withSuccessHandler);

    let runner = new DeclarationReflection("Runner", ReflectionKind.Class);
    runner.children = publicFunctions;
    runner.setFlag(ReflectionFlag.Public, true);

    let run = new DeclarationReflection("run", ReflectionKind.Variable);
    run.type = ReferenceType.createResolvedReference("Runner", run, kind);
    run.setFlag(ReflectionFlag.Public, true);

    script.children = [runner, run, ...otherChildren];

    let google = new ProjectReflection("google");
    google.kind = ReflectionKind.Module;
    google.children = [script];
    google.setFlag(ReflectionFlag.Public, true);
    return google;
  }

}
