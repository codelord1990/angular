library angular2.src.change_detection.pregen_proto_change_detector;

import 'package:angular2/src/change_detection/coalesce.dart';
import 'package:angular2/src/change_detection/directive_record.dart';
import 'package:angular2/src/change_detection/interfaces.dart';
import 'package:angular2/src/change_detection/proto_change_detector.dart';
import 'package:angular2/src/change_detection/proto_record.dart';

export 'dart:core' show List;
export 'package:angular2/src/change_detection/abstract_change_detector.dart'
    show AbstractChangeDetector;
export 'package:angular2/src/change_detection/change_detection.dart'
    show preGeneratedProtoDetectors;
export 'package:angular2/src/change_detection/directive_record.dart'
    show DirectiveIndex, DirectiveRecord;
export 'package:angular2/src/change_detection/interfaces.dart'
    show ChangeDetector, ChangeDetectorDefinition, ProtoChangeDetector;
export 'package:angular2/src/change_detection/pipes/pipe_registry.dart'
    show PipeRegistry;
export 'package:angular2/src/change_detection/proto_record.dart'
    show ProtoRecord;
export 'package:angular2/src/change_detection/change_detection_util.dart'
    show ChangeDetectionUtil;
export 'package:angular2/src/facade/lang.dart' show looseIdentical;

typedef ProtoChangeDetector PregenProtoChangeDetectorFactory(
    ChangeDetectorDefinition definition);

typedef ChangeDetector InstantiateMethod(dynamic dispatcher,
    List<ProtoRecord> protoRecords,
    List<DirectiveRecord> directiveRecords);

/// Implementation of [ProtoChangeDetector] for use by pre-generated change
/// detectors in Angular 2 Dart.
/// Classes generated by the `TemplateCompiler` use this. The `export`s above
/// allow the generated code to `import` a single library and get all
/// dependencies.
class PregenProtoChangeDetector extends ProtoChangeDetector {
  /// The [ChangeDetectorDefinition#id]. Strictly informational.
  final String id;

  /// Closure used to generate an actual [ChangeDetector].
  final InstantiateMethod _instantiateMethod;

  // [ChangeDetector] dependencies.
  final List<ProtoRecord> _protoRecords;
  final List<DirectiveRecord> _directiveRecords;

  /// Internal ctor.
  PregenProtoChangeDetector._(this.id, this._instantiateMethod,
      this._protoRecords, this._directiveRecords);

  static bool isSupported() => true;

  factory PregenProtoChangeDetector(InstantiateMethod instantiateMethod,
      ChangeDetectorDefinition def) {
    // TODO(kegluneq): Pre-generate these (#2067).
    var recordBuilder = new ProtoRecordBuilder();
    def.bindingRecords.forEach((b) {
      recordBuilder.add(b, def.variableNames);
    });
    var protoRecords = coalesce(recordBuilder.records);
    return new PregenProtoChangeDetector._(def.id, instantiateMethod,
        protoRecords, def.directiveRecords);
  }

  @override
  instantiate(dynamic dispatcher) => _instantiateMethod(
      dispatcher, _protoRecords, _directiveRecords);
}
