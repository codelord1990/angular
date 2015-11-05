library angular2.transform.common.options_reader;

import 'package:barback/barback.dart';
import 'annotation_matcher.dart';
import 'mirror_mode.dart';
import 'options.dart';

TransformerOptions parseBarbackSettings(BarbackSettings settings) {
  var config = settings.configuration;
  _warnDeprecated(config);
  var entryPoints = _readStringList(config, ENTRY_POINT_PARAM);
  var initReflector =
      _readBool(config, INIT_REFLECTOR_PARAM, defaultValue: true);
  var reflectPropertiesAsAttributes =
      _readBool(config, REFLECT_PROPERTIES_AS_ATTRIBUTES, defaultValue: false);
  if (!config.containsKey(REFLECT_PROPERTIES_AS_ATTRIBUTES)) {
    reflectPropertiesAsAttributes = _readBool(
        config, REFLECT_PROPERTIES_AS_ATTRIBUTES_OLD,
        defaultValue: false);
  }
  var ambientDirectives = _readStringList(config, AMBIENT_DIRECTIVES);
  var formatCode = _readBool(config, FORMAT_CODE_PARAM, defaultValue: false);
  String mirrorModeVal =
      config.containsKey(MIRROR_MODE_PARAM) ? config[MIRROR_MODE_PARAM] : '';
  var mirrorMode = MirrorMode.none;
  switch (mirrorModeVal) {
    case 'debug':
      mirrorMode = MirrorMode.debug;
      break;
    case 'verbose':
      mirrorMode = MirrorMode.verbose;
      break;
    default:
      mirrorMode = MirrorMode.none;
      break;
  }
  return new TransformerOptions(entryPoints,
      modeName: settings.mode.name,
      mirrorMode: mirrorMode,
      initReflector: initReflector,
      customAnnotationDescriptors: _readCustomAnnotations(config),
      reflectPropertiesAsAttributes: reflectPropertiesAsAttributes,
      ambientDirectives: ambientDirectives,
      inlineViews: _readBool(config, INLINE_VIEWS_PARAM, defaultValue: false),
      formatCode: formatCode);
}

bool _readBool(Map config, String paramName, {bool defaultValue}) {
  return config.containsKey(paramName)
      ? config[paramName] != false
      : defaultValue;
}

/// Cribbed from the polymer project.
/// {@link https://github.com/dart-lang/polymer-dart}
List<String> _readStringList(Map config, String paramName) {
  var value = config[paramName];
  if (value == null) return null;
  var result = [];
  bool error = false;
  if (value is List) {
    result = value;
    error = value.any((e) => e is! String);
  } else if (value is String) {
    result = [value];
    error = false;
  } else {
    error = true;
  }
  if (error) {
    print('Invalid value for "$paramName" in the Angular 2 transformer.');
  }
  return result;
}

/// Parse the [CUSTOM_ANNOTATIONS_PARAM] options out of the transformer into
/// [ClassDescriptor]s.
List<ClassDescriptor> _readCustomAnnotations(Map config) {
  var descriptors = [];
  var customAnnotations = config[CUSTOM_ANNOTATIONS_PARAM];
  if (customAnnotations == null) return descriptors;
  var error = false;
  if (customAnnotations is! List) {
    error = true;
  } else {
    for (var description in customAnnotations) {
      if (description is! Map) {
        error = true;
        continue;
      }
      var name = description['name'];
      var import = description['import'];
      var superClass = description['superClass'];
      if (name == null || import == null || superClass == null) {
        error = true;
        continue;
      }
      descriptors
          .add(new ClassDescriptor(name, import, superClass: superClass));
    }
  }
  if (error) {
    print(CUSTOM_ANNOTATIONS_ERROR);
  }
  return descriptors;
}

const CUSTOM_ANNOTATIONS_ERROR = '''
  Invalid value for $CUSTOM_ANNOTATIONS_PARAM in the Angular2 transformer.
  Expected something that looks like the following:

  transformers:
  - angular2:
      custom_annotations:
        - name: MyAnnotation
          import: 'package:my_package/my_annotation.dart'
          superClass: Component
        - name: ...
          import: ...
          superClass: ...''';

void _warnDeprecated(Map config) {
  if (config.containsKey(REFLECT_PROPERTIES_AS_ATTRIBUTES_OLD)) {
    print('${REFLECT_PROPERTIES_AS_ATTRIBUTES_OLD} has been renamed to '
        '${REFLECT_PROPERTIES_AS_ATTRIBUTES}. Please update it in your '
        'pubspec.');
  }
}
