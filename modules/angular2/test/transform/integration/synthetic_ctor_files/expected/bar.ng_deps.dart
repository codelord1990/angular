library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/annotations_impl/annotations.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(MyComponent, {
      'factory': () => new MyComponent(),
      'parameters': const [],
      'annotations': const [const Component(selector: '[soup]')]
    });
}
