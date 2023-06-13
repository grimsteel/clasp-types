import { Comment, ContainerReflection, DeclarationReflection, ParameterReflection, SomeType, UnionType } from "typedoc";
import { Builder } from "./builders/Builder";

export abstract class Definition<T=ContainerReflection> {

  protected kind: T;
  protected depth: number;

  constructor(kind: T, depth: number) {
    this.kind = kind;
    this.depth = depth;
  }

  protected ident() {
    return " ".repeat(this.depth * 4);
  }

  protected tab() {
    return this.depth + 1;
  }

  abstract render(builder: Builder): void;

  protected addComment(builder: Builder, comment?: Comment): void {
    if (comment && (comment.blockTags?.length >= 1 || comment.label || comment.summary?.length >= 1)) {
      builder.append(`${this.ident()}/**`).line()
      if (comment.label) {
        builder.append(`${this.ident()} * ${this.identBreaks(comment.label)}`).line()
      }
      if (comment.summary?.length >= 1) {
        builder.append(`${this.ident()} * ${this.identBreaks(comment.summary[0].text)}`).line()
      }
      if (comment.blockTags?.length >= 1) {
        for (let i = 0; i < comment.blockTags.length; i++) {
          const tag = comment.blockTags[i];
          builder.append(`${this.ident()} * @${tag.tag} ${this.identBreaks(tag.tag)}`).line()
          if (i+1 < comment.blockTags.length) {
            builder.append(`${this.ident()} *`).line()
          }
        }
      }
      builder.append(`${this.ident()} */`).line()
    }
  }

  private identBreaks(text: string|undefined): string {
    if (text == null) {
      return '';
    }
    if (text.endsWith('\n')) {
      var pos = text.lastIndexOf('\n');
      text = text.substring(0, pos);
    }
    return text.replace(new RegExp("\n", 'g'), `\n${this.ident()} * `)
  }

  protected buildType(builder: Builder, type?: SomeType): void {
    if (type) {
      if (type instanceof UnionType && type.types) {
        builder.append('(');
        type.types.forEach((t, key, arr) => {
          this.buildType(builder, t)
          if (!Object.is(arr.length - 1, key)) {
            //Last item
            builder.append(' | ')
          }
        });
        builder.append(')');
        return
      } else if (type.type === 'array') {
        this.buildType(builder, type.elementType);
        builder.append('[]')
        return
      } else if (type.type === 'reflection' && type.declaration) {
        if (type.declaration.signatures && type.declaration.signatures.length > 0) {
          let signature = type.declaration.signatures[0];
          builder.append('(')
          this.buildParams(builder, signature.parameters!)
          builder.append(')')
          builder.append(' => ')
          this.buildType(builder, signature.type)
        } else if (type.declaration.children && type.declaration.children.length > 0) {
          builder.append('{')
          this.buildParams(builder, type.declaration.children)
          builder.append('}')
        } else if (type.declaration.indexSignature) {
          let indexSignature = type.declaration.indexSignature;
          builder.append('{[')
          this.buildParams(builder, indexSignature.parameters!)
          builder.append(']: ')
          this.buildType(builder, indexSignature.type)
          builder.append('}')
        }
        return;
      }
      //builder.append(type.toString());
      if ("name" in type && (type.name === 'true' || type.name === 'false')) {
        builder.append('boolean');
      } else if ("qualifiedName" in type && type.qualifiedName !== undefined) {
        builder.append(type.qualifiedName);
      } else if ("name" in type && type.name !== undefined) {
        builder.append(type.name);
      } else if ("value" in type && type.value !== undefined) {
        builder.append(JSON.stringify(type.value));
      }
    }
  }

  protected buildParams(builder: Builder, parameters: (ParameterReflection | DeclarationReflection)[]) {
    if (parameters) {
      parameters.forEach((param, key, arr) => {
        this.buildParam(builder, param)
        if (!Object.is(arr.length - 1, key)) {
          //Last item
          builder.append(', ')
        }
      });
    }
  }

  protected buildParam(builder: Builder, param: (ParameterReflection | DeclarationReflection)): void {
    let sep = (param.flags.isOptional || param.defaultValue !== undefined) && param instanceof ParameterReflection ? '?:' : ':';
    let rest = param.flags.isRest ? '...' : '';
    builder.append(rest).append(param.name).append(sep).append(' ');
    this.buildType(builder, param.type);
  }

}