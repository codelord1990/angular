library angular2.transform.template_compiler.transformer;

import 'dart:async';

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

import 'generator.dart';

/// {@link Transformer} responsible for detecting and processing Angular 2 templates.
///
/// {@link TemplateCompiler} uses the Angular 2 `Compiler` to process the templates,
/// extracting information about what reflection is necessary to render and
/// use that template. It then generates code in place of those reflective
/// accesses.
class TemplateCompiler extends Transformer {
  final TransformerOptions options;

  TemplateCompiler(this.options);

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_EXTENSION);

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      Html5LibDomAdapter.makeCurrent();
      var primaryId = transform.primaryInput.id;
      var reader = new AssetReader.fromTransform(transform);
      var outputs = await processTemplates(reader, primaryId,
          reflectPropertiesAsAttributes: options.reflectPropertiesAsAttributes);
      var ngDepsCode = '';
      var templatesCode = '';
      if (outputs != null) {
        if (outputs.ngDepsCode != null) {
          ngDepsCode = formatter.format(outputs.ngDepsCode);
        }
        if (outputs.templatesCode != null) {
          templatesCode = formatter.format(outputs.templatesCode);
        }
      }
      transform.addOutput(new Asset.fromString(primaryId, ngDepsCode));
      transform.addOutput(
          new Asset.fromString(templatesAssetId(primaryId), templatesCode));
    });
  }
}
