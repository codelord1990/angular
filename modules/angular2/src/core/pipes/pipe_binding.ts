import {Type} from 'angular2/src/core/facade/lang';
import {Key, ResolvedBinding, Binding} from 'angular2/di';
import {ResolvedFactory, resolveBinding} from 'angular2/src/core/di/binding';
import {PipeMetadata} from '../metadata/directives';

export class PipeBinding extends ResolvedBinding {
  constructor(public name: string, key: Key, resolvedFactories: ResolvedFactory[],
              multiBinding: boolean) {
    super(key, resolvedFactories, multiBinding);
  }

  static createFromType(type: Type, metadata: PipeMetadata): PipeBinding {
    var binding = new Binding(type, {toClass: type});
    var rb = resolveBinding(binding);
    return new PipeBinding(metadata.name, rb.key, rb.resolvedFactories, rb.multiBinding);
  }
}
