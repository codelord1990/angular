import {PromiseWrapper} from '../../src/facade/async';
import {DomAdapter} from '@angular/platform-browser/src/dom/dom_adapter';
import {ElementRef} from '@angular/core/src/linker/element_ref';

export class Rectangle {
  left;
  right;
  top;
  bottom;
  height;
  width;
  constructor(left, top, width, height) {
    this.left = left;
    this.right = left + width;
    this.top = top;
    this.bottom = top + height;
    this.height = height;
    this.width = width;
  }
}

export class Ruler {
  domAdapter: DomAdapter;
  constructor(domAdapter: DomAdapter) { this.domAdapter = domAdapter; }

  measure(el: ElementRef): Promise<Rectangle> {
    var clntRect = <any>this.domAdapter.getBoundingClientRect(el.nativeElement);

    // even if getBoundingClientRect is synchronous we use async API in preparation for further
    // changes
    return PromiseWrapper.resolve(
        new Rectangle(clntRect.left, clntRect.top, clntRect.width, clntRect.height));
  }
}
