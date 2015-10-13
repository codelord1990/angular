import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/testing_internal';
import {isBlank} from 'angular2/src/core/facade/lang';

import {coalesce} from 'angular2/src/core/change_detection/coalesce';
import {RecordType, ProtoRecord} from 'angular2/src/core/change_detection/proto_record';
import {DirectiveIndex} from 'angular2/src/core/change_detection/directive_record';

export function main() {
  function r(funcOrValue, args, contextIndex, selfIndex,
             {lastInBinding, mode, name, directiveIndex, argumentToPureFunction}: {
               lastInBinding?: any,
               mode?: any,
               name?: any,
               directiveIndex?: any,
               argumentToPureFunction?: boolean
             } = {}) {
    if (isBlank(lastInBinding)) lastInBinding = false;
    if (isBlank(mode)) mode = RecordType.PropertyRead;
    if (isBlank(name)) name = "name";
    if (isBlank(directiveIndex)) directiveIndex = null;
    if (isBlank(argumentToPureFunction)) argumentToPureFunction = false;

    return new ProtoRecord(mode, name, funcOrValue, args, null, contextIndex, directiveIndex,
                           selfIndex, null, lastInBinding, false, argumentToPureFunction, false, 0);
  }

  describe("change detection - coalesce", () => {
    it("should work with an empty list", () => { expect(coalesce([])).toEqual([]); });

    it("should remove non-terminal duplicate records" +
           " and update the context indices referencing them",
       () => {
         var rs = coalesce(
             [r("user", [], 0, 1), r("first", [], 1, 2), r("user", [], 0, 3), r("last", [], 3, 4)]);

         expect(rs).toEqual([r("user", [], 0, 1), r("first", [], 1, 2), r("last", [], 1, 3)]);
       });

    it("should update indices of other records", () => {
      var rs = coalesce(
          [r("dup", [], 0, 1), r("dup", [], 0, 2), r("user", [], 0, 3), r("first", [3], 3, 4)]);

      expect(rs).toEqual([r("dup", [], 0, 1), r("user", [], 0, 2), r("first", [2], 2, 3)]);
    });

    it("should remove non-terminal duplicate records" +
           " and update the args indices referencing them",
       () => {
         var rs = coalesce([
           r("user1", [], 0, 1),
           r("user2", [], 0, 2),
           r("hi", [1], 0, 3),
           r("hi", [1], 0, 4),
           r("hi", [2], 0, 5)
         ]);

         expect(rs).toEqual(
             [r("user1", [], 0, 1), r("user2", [], 0, 2), r("hi", [1], 0, 3), r("hi", [2], 0, 4)]);
       });

    it("should replace duplicate terminal records with self records", () => {
      var rs = coalesce(
          [r("user", [], 0, 1, {lastInBinding: true}), r("user", [], 0, 2, {lastInBinding: true})]);

      expect(rs[1]).toEqual(new ProtoRecord(RecordType.Self, "self", null, [], null, 1, null, 2,
                                            null, true, false, false, false, 0));
    });

    it("should set referencedBySelf", () => {
      var rs = coalesce(
          [r("user", [], 0, 1, {lastInBinding: true}), r("user", [], 0, 2, {lastInBinding: true})]);

      expect(rs[0].referencedBySelf).toBeTruthy();
    });

    it("should not coalesce directive lifecycle records", () => {
      var rs = coalesce([
        r("doCheck", [], 0, 1, {mode: RecordType.DirectiveLifecycle}),
        r("doCheck", [], 0, 1, {mode: RecordType.DirectiveLifecycle})
      ]);

      expect(rs.length).toEqual(2);
    });

    it("should not coalesce protos with different names but same value", () => {
      var nullFunc = () => {};
      var rs = coalesce([
        r(nullFunc, [], 0, 1, {name: "foo"}),
        r(nullFunc, [], 0, 1, {name: "bar"}),
      ]);
      expect(rs.length).toEqual(2);
    });

    it("should not coalesce protos with the same context index but different directive indices",
       () => {
         var nullFunc = () => {};
         var rs = coalesce([
           r(nullFunc, [], 0, 1, {directiveIndex: new DirectiveIndex(0, 0)}),
           r(nullFunc, [], 0, 1, {directiveIndex: new DirectiveIndex(0, 1)}),
           r(nullFunc, [], 0, 1, {directiveIndex: new DirectiveIndex(1, 0)}),
           r(nullFunc, [], 0, 1, {directiveIndex: null}),
         ]);
         expect(rs.length).toEqual(4);
       });

    it('should preserve the argumentToPureFunction property', () => {
      var rs = coalesce([
        r("user", [], 0, 1),
        r("user", [], 0, 2, {argumentToPureFunction: true}),
        r("user", [], 0, 3),
        r("name", [], 3, 4)
      ]);
      expect(rs)
          .toEqual([r("user", [], 0, 1, {argumentToPureFunction: true}), r("name", [], 1, 2)]);
    });

    it('should preserve the argumentToPureFunction property (the original record)', () => {
      var rs = coalesce([
        r("user", [], 0, 1, {argumentToPureFunction: true}),
        r("user", [], 0, 2),
        r("name", [], 2, 3)
      ]);
      expect(rs)
          .toEqual([r("user", [], 0, 1, {argumentToPureFunction: true}), r("name", [], 1, 2)]);
    });
  });
}
