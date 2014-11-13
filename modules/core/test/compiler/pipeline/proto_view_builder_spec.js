import {describe, beforeEach, it, expect, iit, ddescribe} from 'test_lib/test_lib';
import {isPresent} from 'facade/lang';
import {ElementBinder} from 'core/compiler/element_binder';
import {ProtoViewBuilder} from 'core/compiler/pipeline/proto_view_builder';
import {CompilePipeline} from 'core/compiler/pipeline/compile_pipeline';
import {CompileElement} from 'core/compiler/pipeline/compile_element';
import {CompileStep} from 'core/compiler/pipeline/compile_step'
import {CompileControl} from 'core/compiler/pipeline/compile_control';
import {DOM} from 'facade/dom';

export function main() {
  describe('ProtoViewBuilder', () => {
    function createPipeline() {
      return new CompilePipeline([new MockStep((parent, current, control) => {
        if (isPresent(current.element.getAttribute('viewroot'))) {
          current.isViewRoot = true;
        }
        current.inheritedElementBinder = new ElementBinder(null, null, null);
      }), new ProtoViewBuilder()]);
    }

    it('should not create a ProtoView when the isViewRoot flag is not set', () => {
      var results = createPipeline().process(createElement('<div></div>'));
      expect(results[0].inheritedProtoView).toBe(null);
    });

    it('should create a ProtoView when the isViewRoot flag is set', () => {
      var viewRootElement = createElement('<div viewroot></div>');
      var results = createPipeline().process(viewRootElement);
      expect(results[0].inheritedProtoView.element).toBe(viewRootElement);
    });

    it('should inherit the ProtoView down to children that have no isViewRoot set', () => {
      var viewRootElement = createElement('<div viewroot><span></span></div>');
      var results = createPipeline().process(viewRootElement);
      expect(results[0].inheritedProtoView.element).toBe(viewRootElement);
      expect(results[1].inheritedProtoView.element).toBe(viewRootElement);
    });

    it('should save ProtoView into elementBinder of parent element', () => {
      var el = createElement('<div viewroot><span><a viewroot></a></span></div>');
      var results = createPipeline().process(el);
      expect(results[1].inheritedElementBinder.nestedProtoView).toBe(results[2].inheritedProtoView);
    });

    describe('errors', () => {

      it('should not allow multiple nested ProtoViews for the same parent element', () => {
        var el = createElement('<div viewroot><span><a viewroot></a><a viewroot></a></span></div>');
        expect( () => {
          createPipeline().process(el);
        }).toThrowError('Only one nested view per element is allowed');
      });

    });

  });
}

class MockStep extends CompileStep {
  constructor(process) {
    this.processClosure = process;
  }
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {
    this.processClosure(parent, current, control);
  }
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}