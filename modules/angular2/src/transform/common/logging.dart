library angular2.transform.common.logging;

import 'dart:async';
import 'package:barback/barback.dart';
import 'package:code_transformers/messages/build_logger.dart';
import 'package:source_span/source_span.dart';

typedef _SimpleCallback();

// The key used to store the logger on the current zone.
final _key = #loggingZonedLoggerKey;

/// Executes {@link fn} inside a new {@link Zone} with its own logger.
dynamic initZoned(Transform t, _SimpleCallback fn, {String errorMessage: ''}) =>
    setZoned(new BuildLogger(t), fn, errorMessage: errorMessage);

dynamic setZoned(BuildLogger logger, _SimpleCallback fn,
    {String errorMessage: ''}) => runZoned(fn,
        zoneValues: {_key: logger}, onError: (e, stackTrace) {
  logger.error('$errorMessage\n'
      'Exception: $e\n'
      'Stack Trace: $stackTrace');
});

/// The logger for the current {@link Zone}.
BuildLogger get logger {
  var current = Zone.current[_key] as BuildLogger;
  return current == null ? new PrintLogger() : current;
}

class PrintLogger implements BuildLogger {
  @override
  final String detailsUri = '';
  @override
  final bool convertErrorsToWarnings = false;

  void _printWithPrefix(prefix, msg) => print('$prefix: $msg');
  void info(msg, {AssetId asset, SourceSpan span}) =>
      _printWithPrefix('INFO', msg);
  void fine(msg, {AssetId asset, SourceSpan span}) =>
      _printWithPrefix('FINE', msg);
  void warning(msg, {AssetId asset, SourceSpan span}) =>
      _printWithPrefix('WARN', msg);
  void error(msg, {AssetId asset, SourceSpan span}) {
    throw new PrintLoggerError(msg, asset, span);
  }
  Future writeOutput() => null;
  Future addLogFilesFromAsset(AssetId id, [int nextNumber = 1]) => null;
}

class PrintLoggerError extends Error {
  final String message;
  final AssetId asset;
  final SourceSpan span;

  PrintLoggerError(this.message, this.asset, this.span);

  @override
  String toString() {
    return 'Message: ${Error.safeToString(message)}, '
        'Asset: ${Error.safeToString(asset)}, '
        'Span: ${Error.safeToString(span)}.';
  }
}
