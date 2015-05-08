library angular2.test.transform.directive_processor.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import '../common/read_file.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';
import 'package:path/path.dart' as path;

var formatter = new DartFormatter();

main() {
  allTests();
}

void allTests() {
  _testNgDeps('should preserve parameter annotations as const instances.',
      'parameter_metadata/soup.dart');

  _testNgDeps('should recognize custom annotations with package: imports',
      'custom_metadata/package_soup.dart',
      customDescriptors: [
    const AnnotationDescriptor('Soup', 'package:soup/soup.dart', 'Component'),
  ]);

  _testNgDeps('should recognize custom annotations with relative imports',
      'custom_metadata/relative_soup.dart',
      assetId: new AssetId('soup', 'lib/relative_soup.dart'),
      customDescriptors: [
    const AnnotationDescriptor(
        'Soup', 'package:soup/annotations/soup.dart', 'Component'),
  ]);

  _testNgDeps('Requires the specified import.', 'custom_metadata/bad_soup.dart',
      customDescriptors: [
    const AnnotationDescriptor('Soup', 'package:soup/soup.dart', 'Component'),
  ]);
}

void _testNgDeps(String name, String inputPath,
    {List<AnnotationDescriptor> customDescriptors: const [], AssetId assetId}) {
  it(name, () async {
    var inputId = _assetIdForPath(inputPath);
    var reader = new TestAssetReader();
    var input = await reader.readAsString(inputId);
    var annotationMatcher = new AnnotationMatcher()..addAll(customDescriptors);
    var proxyInputId = assetId != null ? assetId : inputId;
    var output =
        formatter.format(createNgDeps(input, proxyInputId, annotationMatcher));
    var expectedPath = path.join(path.dirname(inputPath), 'expected',
        path.basename(inputPath).replaceFirst('.dart', '.ng_deps.dart'));
    var expectedId = _assetIdForPath(expectedPath);
    expect(output).toEqual(await reader.readAsString(expectedId));
  });
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/directive_processor/$path');
