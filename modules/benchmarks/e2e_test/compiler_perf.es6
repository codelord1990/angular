var perfUtil = require('../../e2e_test_lib/e2e_test/perf_util');

describe('ng2 compiler benchmark', function () {

  var URL = 'benchmarks/src/compiler/compiler_benchmark.html';

  afterEach(perfUtil.verifyNoBrowserErrors);

  it('should log withBindings stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#compileWithBindings'],
      id: 'ng2.compile.withBindings',
      params: [{
        name: 'elements', value: 150, scale: 'linear'
      }]
    });
  });

  it('should log noBindings stats', function() {
    perfUtil.runClickBenchmark({
      url: URL,
      buttons: ['#compileNoBindings'],
      id: 'ng2.compile.noBindings',
      params: [{
        name: 'elements', value: 150, scale: 'linear'
      }]
    });
  });

});
