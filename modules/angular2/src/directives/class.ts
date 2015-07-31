import {isPresent, isString, StringWrapper, isBlank} from 'angular2/src/facade/lang';
import {Directive, LifecycleEvent} from 'angular2/annotations';
import {ElementRef} from 'angular2/core';
import {Renderer} from 'angular2/src/render/api';
import {
  KeyValueDiffer,
  IterableDiffer,
  IterableDiffers,
  KeyValueDiffers
} from 'angular2/change_detection';
import {ListWrapper, StringMapWrapper, isListLikeIterable} from 'angular2/src/facade/collection';

/**
 * Adds and removes CSS classes based on an {expression} value.
 *
 * The result of expression is used to add and remove CSS classes using the following logic,
 * based on expression's value type:
 * - {string} - all the CSS classes (space - separated) are added
 * - {Array} - all the CSS classes (Array elements) are added
 * - {Object} - each key corresponds to a CSS class name while values
 * are interpreted as {boolean} expression. If a given expression
 * evaluates to {true} a corresponding CSS class is added - otherwise
 * it is removed.
 *
 * # Example:
 *
 * ```
 * <div class="message" [class]="{error: errorCount > 0}">
 *     Please check errors.
 * </div>
 * ```
 */
@Directive({
  selector: '[class]',
  lifecycle: [LifecycleEvent.onCheck, LifecycleEvent.onDestroy],
  properties: ['rawClass: class']
})
export class CSSClass {
  private _differ: any;
  private _mode: string;
  _rawClass;

  constructor(private _iterableDiffers: IterableDiffers, private _keyValueDiffers: KeyValueDiffers,
              private _ngEl: ElementRef, private _renderer: Renderer) {}

  set rawClass(v) {
    this._cleanupClasses(this._rawClass);

    if (isString(v)) {
      v = v.split(' ');
    }

    this._rawClass = v;
    if (isPresent(v)) {
      if (isListLikeIterable(v)) {
        this._differ = this._iterableDiffers.find(v).create(null);
        this._mode = 'iterable';
      } else {
        this._differ = this._keyValueDiffers.find(v).create(null);
        this._mode = 'keyValue';
      }
    }
  }

  onCheck(): void {
    if (isPresent(this._differ)) {
      var changes = this._differ.diff(this._rawClass);
      if (isPresent(changes)) {
        if (this._mode == 'iterable') {
          this._applyIterableChanges(changes);
        } else {
          this._applyKeyValueChanges(changes);
        }
      }
    }
  }

  onDestroy(): void { this._cleanupClasses(this._rawClass); }

  private _cleanupClasses(rawClassVal): void {
    if (isPresent(rawClassVal)) {
      if (isListLikeIterable(rawClassVal)) {
        ListWrapper.forEach(rawClassVal, (className) => { this._toggleClass(className, false); });
      } else {
        StringMapWrapper.forEach(rawClassVal, (expVal, className) => {
          if (expVal) this._toggleClass(className, false);
        });
      }
    }
  }

  private _applyKeyValueChanges(changes: any): void {
    changes.forEachAddedItem((record) => { this._toggleClass(record.key, record.currentValue); });
    changes.forEachChangedItem((record) => { this._toggleClass(record.key, record.currentValue); });
    changes.forEachRemovedItem((record) => {
      if (record.previousValue) {
        this._toggleClass(record.key, false);
      }
    });
  }

  private _applyIterableChanges(changes: any): void {
    changes.forEachAddedItem((record) => { this._toggleClass(record.item, true); });
    changes.forEachRemovedItem((record) => { this._toggleClass(record.item, false); });
  }

  private _toggleClass(className: string, enabled): void {
    this._renderer.setElementClass(this._ngEl, className, enabled);
  }
}
