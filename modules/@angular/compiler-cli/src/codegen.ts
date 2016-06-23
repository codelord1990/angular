/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Transform template html and css into executable code.
 * Intended to be used in a build step.
 */
import * as compiler from '@angular/compiler';
import {ViewEncapsulation, lockRunMode} from '@angular/core';
import {AngularCompilerOptions} from '@angular/tsc-wrapped';
import * as path from 'path';
import * as ts from 'typescript';

import {CompileMetadataResolver, DirectiveNormalizer, DomElementSchemaRegistry, HtmlParser, Lexer, Parser, StyleCompiler, TemplateParser, TypeScriptEmitter, ViewCompiler} from './compiler_private';
import {ReflectorHost, ReflectorHostContext} from './reflector_host';
import {StaticAndDynamicReflectionCapabilities} from './static_reflection_capabilities';
import {StaticReflector} from './static_reflector';

const GENERATED_FILES = /\.ngfactory\.ts$|\.css\.ts$|\.css\.shim\.ts$/;

const PREAMBLE = `/**
 * This file is generated by the Angular 2 template compiler.
 * Do not edit.
 */
 /* tslint:disable */

`;

export class CodeGenerator {
  constructor(
      private options: AngularCompilerOptions, private program: ts.Program,
      public host: ts.CompilerHost, private staticReflector: StaticReflector,
      private resolver: CompileMetadataResolver, private compiler: compiler.OfflineCompiler,
      private reflectorHost: ReflectorHost) {
    lockRunMode();
  }

  private generateSource(metadatas: compiler.CompileDirectiveMetadata[]) {
    const normalize = (metadata: compiler.CompileDirectiveMetadata) => {
      const directiveType = metadata.type.runtime;
      const directives = this.resolver.getViewDirectivesMetadata(directiveType);
      return Promise.all(directives.map(d => this.compiler.normalizeDirectiveMetadata(d)))
          .then(normalizedDirectives => {
            const pipes = this.resolver.getViewPipesMetadata(directiveType);
            return new compiler.NormalizedComponentWithViewDirectives(
                metadata, normalizedDirectives, pipes);
          });
    };
    return Promise.all(metadatas.map(normalize))
        .then(
            normalizedCompWithDirectives =>
                this.compiler.compileTemplates(normalizedCompWithDirectives));
  }

  private readComponents(absSourcePath: string) {
    const result: Promise<compiler.CompileDirectiveMetadata>[] = [];
    const moduleMetadata = this.staticReflector.getModuleMetadata(absSourcePath);
    if (!moduleMetadata) {
      console.log(`WARNING: no metadata found for ${absSourcePath}`);
      return result;
    }
    const metadata = moduleMetadata['metadata'];
    const symbols = metadata && Object.keys(metadata);
    if (!symbols || !symbols.length) {
      return result;
    }
    for (const symbol of symbols) {
      if (metadata[symbol] && metadata[symbol].__symbolic == 'error') {
        // Ignore symbols that are only included to record error information.
        continue;
      }
      const staticType = this.reflectorHost.findDeclaration(absSourcePath, symbol, absSourcePath);
      let directive: compiler.CompileDirectiveMetadata;
      directive = this.resolver.maybeGetDirectiveMetadata(<any>staticType);

      if (!directive || !directive.isComponent) {
        continue;
      }
      result.push(this.compiler.normalizeDirectiveMetadata(directive));
    }
    return result;
  }

  // Write codegen in a directory structure matching the sources.
  private calculateEmitPath(filePath: string) {
    let root = this.options.basePath;
    for (let eachRootDir of this.options.rootDirs || []) {
      if (this.options.trace) {
        console.log(`Check if ${filePath} is under rootDirs element ${eachRootDir}`);
      }
      if (path.relative(eachRootDir, filePath).indexOf('.') !== 0) {
        root = eachRootDir;
      }
    }

    return path.join(this.options.genDir, path.relative(root, filePath));
  }

  // TODO(tbosch): add a cache for shared css files
  // TODO(tbosch): detect cycles!
  private generateStylesheet(filepath: string, shim: boolean): Promise<any> {
    return this.compiler.loadAndCompileStylesheet(filepath, shim, '.ts')
        .then((sourceWithImports) => {
          const emitPath = this.calculateEmitPath(sourceWithImports.source.moduleUrl);
          // TODO(alexeagle): should include the sourceFile to the WriteFileCallback
          this.host.writeFile(emitPath, PREAMBLE + sourceWithImports.source.source, false);
          return Promise.all(
              sourceWithImports.importedUrls.map(url => this.generateStylesheet(url, shim)));
        });
  }

  codegen(): Promise<any> {
    let stylesheetPromises: Promise<any>[] = [];
    const generateOneFile = (absSourcePath: string) =>
        Promise.all(this.readComponents(absSourcePath))
            .then((metadatas: compiler.CompileDirectiveMetadata[]) => {
              if (!metadatas || !metadatas.length) {
                return;
              }
              metadatas.forEach((metadata) => {
                let stylesheetPaths = metadata && metadata.template && metadata.template.styleUrls;
                if (stylesheetPaths) {
                  stylesheetPaths.forEach((path) => {
                    stylesheetPromises.push(this.generateStylesheet(
                        path, metadata.template.encapsulation === ViewEncapsulation.Emulated));
                  });
                }
              });
              return this.generateSource(metadatas);
            })
            .then(generated => {
              if (generated) {
                const sourceFile = this.program.getSourceFile(absSourcePath);
                const emitPath = this.calculateEmitPath(generated.moduleUrl);
                this.host.writeFile(
                    emitPath, PREAMBLE + generated.source, false, () => {}, [sourceFile]);
              }
            })
            .catch((e) => { console.error(e.stack); });
    var compPromises = this.program.getSourceFiles()
                           .map(sf => sf.fileName)
                           .filter(f => !GENERATED_FILES.test(f))
                           .map(generateOneFile);
    return Promise.all(stylesheetPromises.concat(compPromises));
  }

  static create(
      options: AngularCompilerOptions, program: ts.Program, compilerHost: ts.CompilerHost,
      reflectorHostContext?: ReflectorHostContext): CodeGenerator {
    const xhr: compiler.XHR = {get: (s: string) => Promise.resolve(compilerHost.readFile(s))};
    const urlResolver: compiler.UrlResolver = compiler.createOfflineCompileUrlResolver();
    const reflectorHost = new ReflectorHost(program, compilerHost, options, reflectorHostContext);
    const staticReflector = new StaticReflector(reflectorHost);
    StaticAndDynamicReflectionCapabilities.install(staticReflector);
    const htmlParser = new HtmlParser();
    const config = new compiler.CompilerConfig({
      genDebugInfo: options.debug === true,
      defaultEncapsulation: ViewEncapsulation.Emulated,
      logBindingUpdate: false,
      useJit: false,
      platformDirectives: [],
      platformPipes: []
    });
    const normalizer = new DirectiveNormalizer(xhr, urlResolver, htmlParser, config);
    const parser = new Parser(new Lexer());
    const tmplParser = new TemplateParser(
        parser, new DomElementSchemaRegistry(), htmlParser,
        /*console*/ null, []);
    const offlineCompiler = new compiler.OfflineCompiler(
        normalizer, tmplParser, new StyleCompiler(urlResolver), new ViewCompiler(config),
        new TypeScriptEmitter(reflectorHost), xhr);
    const resolver = new CompileMetadataResolver(
        new compiler.DirectiveResolver(staticReflector), new compiler.PipeResolver(staticReflector),
        new compiler.ViewResolver(staticReflector), config, staticReflector);

    return new CodeGenerator(
        options, program, compilerHost, staticReflector, resolver, offlineCompiler, reflectorHost);
  }
}
