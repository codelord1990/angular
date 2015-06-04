import {MapWrapper} from 'angular2/src/facade/collection';
import {DirectiveMetadata} from 'angular2/src/render/api';
import {directiveMetadataFromMap, directiveMetadataToMap} from 'angular2/src/render/dom/convert';
import {ddescribe, describe, expect, it} from 'angular2/test_lib';

export function main() {
  describe('convert', () => {
    it('directiveMetadataToMap', () => {
      var someComponent = new DirectiveMetadata({
        compileChildren: false,
        hostListeners: MapWrapper.createFromPairs([['listenKey', 'listenVal']]),
        hostProperties: MapWrapper.createFromPairs([['hostPropKey', 'hostPropVal']]),
        hostActions: MapWrapper.createFromPairs([['hostActionKey', 'hostActionVal']]),
        id: 'someComponent',
        properties: ['propKey: propVal'],
        readAttributes: ['read1', 'read2'],
        selector: 'some-comp',
        type: DirectiveMetadata.COMPONENT_TYPE,
        exportAs: 'aaa',
        callOnDestroy: true,
        callOnChange: true,
        callOnCheck: true,
        callOnInit: true,
        callOnAllChangesDone: true
      });
      var map = directiveMetadataToMap(someComponent);
      expect(MapWrapper.get(map, 'compileChildren')).toEqual(false);
      expect(MapWrapper.get(map, 'hostListeners'))
          .toEqual(MapWrapper.createFromPairs([['listenKey', 'listenVal']]));
      expect(MapWrapper.get(map, 'hostProperties'))
          .toEqual(MapWrapper.createFromPairs([['hostPropKey', 'hostPropVal']]));
      expect(MapWrapper.get(map, 'hostActions'))
          .toEqual(MapWrapper.createFromPairs([['hostActionKey', 'hostActionVal']]));
      expect(MapWrapper.get(map, 'id')).toEqual('someComponent');
      expect(MapWrapper.get(map, 'properties')).toEqual(['propKey: propVal']);
      expect(MapWrapper.get(map, 'readAttributes')).toEqual(['read1', 'read2']);
      expect(MapWrapper.get(map, 'selector')).toEqual('some-comp');
      expect(MapWrapper.get(map, 'type')).toEqual(DirectiveMetadata.COMPONENT_TYPE);
      expect(MapWrapper.get(map, 'callOnDestroy')).toEqual(true);
      expect(MapWrapper.get(map, 'callOnCheck')).toEqual(true);
      expect(MapWrapper.get(map, 'callOnChange')).toEqual(true);
      expect(MapWrapper.get(map, 'callOnInit')).toEqual(true);
      expect(MapWrapper.get(map, 'callOnAllChangesDone')).toEqual(true);
      expect(MapWrapper.get(map, 'exportAs')).toEqual('aaa');
    });

    it('mapToDirectiveMetadata', () => {
      var map = MapWrapper.createFromPairs([
        ['compileChildren', false],
        ['hostListeners', MapWrapper.createFromPairs([['testKey', 'testVal']])],
        ['hostProperties', MapWrapper.createFromPairs([['hostPropKey', 'hostPropVal']])],
        ['hostActions', MapWrapper.createFromPairs([['hostActionKey', 'hostActionVal']])],
        ['id', 'testId'],
        ['properties', ['propKey: propVal']],
        ['readAttributes', ['readTest1', 'readTest2']],
        ['selector', 'testSelector'],
        ['type', DirectiveMetadata.DIRECTIVE_TYPE],
        ['exportAs', 'aaa'],
        ['callOnDestroy', true],
        ['callOnCheck', true],
        ['callOnInit', true],
        ['callOnChange', true],
        ['callOnAllChangesDone', true]
      ]);
      var meta = directiveMetadataFromMap(map);
      expect(meta.compileChildren).toEqual(false);
      expect(meta.hostListeners).toEqual(MapWrapper.createFromPairs([['testKey', 'testVal']]));
      expect(meta.hostProperties)
          .toEqual(MapWrapper.createFromPairs([['hostPropKey', 'hostPropVal']]));
      expect(meta.hostActions)
          .toEqual(MapWrapper.createFromPairs([['hostActionKey', 'hostActionVal']]));
      expect(meta.id).toEqual('testId');
      expect(meta.properties).toEqual(['propKey: propVal']);
      expect(meta.readAttributes).toEqual(['readTest1', 'readTest2']);
      expect(meta.selector).toEqual('testSelector');
      expect(meta.type).toEqual(DirectiveMetadata.DIRECTIVE_TYPE);
      expect(meta.exportAs).toEqual('aaa');
      expect(meta.callOnDestroy).toEqual(true);
      expect(meta.callOnCheck).toEqual(true);
      expect(meta.callOnInit).toEqual(true);
      expect(meta.callOnChange).toEqual(true);
      expect(meta.callOnAllChangesDone).toEqual(true);
    });
  });
}
