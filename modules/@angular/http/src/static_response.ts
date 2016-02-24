/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseException} from '../src/facade/exceptions';
import {Json, isString} from '../src/facade/lang';

import {ResponseOptions} from './base_response_options';
import {ResponseType} from './enums';
import {Headers} from './headers';
import {isJsObject, stringToArrayBuffer} from './http_utils';


/**
 * Creates `Response` instances from provided values.
 *
 * Though this object isn't
 * usually instantiated by end-users, it is the primary object interacted with when it comes time to
 * add data to a view.
 *
 * ### Example
 *
 * ```
 * http.request('my-friends.txt').subscribe(response => this.friends = response.text());
 * ```
 *
 * The Response's interface is inspired by the Response constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#response-class), but is considered a static value whose body
 * can be accessed many times. There are other differences in the implementation, but this is the
 * most significant.
 *
 * @experimental
 */
export class Response {
  /**
   * One of "basic", "cors", "default", "error, or "opaque".
   *
   * Defaults to "default".
   */
  type: ResponseType;
  /**
   * True if the response's status is within 200-299
   */
  ok: boolean;
  /**
   * URL of response.
   *
   * Defaults to empty string.
   */
  url: string;
  /**
   * Status code returned by server.
   *
   * Defaults to 200.
   */
  status: number;
  /**
   * Text representing the corresponding reason phrase to the `status`, as defined in [ietf rfc 2616
   * section 6.1.1](https://tools.ietf.org/html/rfc2616#section-6.1.1)
   *
   * Defaults to "OK"
   */
  statusText: string;
  /**
   * Non-standard property
   *
   * Denotes how many of the response body's bytes have been loaded, for example if the response is
   * the result of a progress event.
   */
  bytesLoaded: number;
  /**
   * Non-standard property
   *
   * Denotes how many bytes are expected in the final response body.
   */
  totalBytes: number;
  /**
   * Headers object based on the `Headers` class in the [Fetch
   * Spec](https://fetch.spec.whatwg.org/#headers-class).
   */
  headers: Headers;

  // TODO: Support FormData, Blob
  private _body: string | Object | ArrayBuffer;

  constructor(responseOptions: ResponseOptions) {
    this._body = responseOptions.body;
    this.status = responseOptions.status;
    this.ok = (this.status >= 200 && this.status <= 299);
    this.statusText = responseOptions.statusText;
    this.headers = responseOptions.headers;
    this.type = responseOptions.type;
    this.url = responseOptions.url;
  }

  /**
   * Attempts to return body as parsed `JSON` object, or raises an exception.
   */
  json(): any {
    var jsonResponse: string|Object;
    if (isJsObject(this._body)) {
      jsonResponse = this._body;
    } else if (isString(this._body)) {
      jsonResponse = Json.parse(<string>this._body);
    } else if (this._body instanceof ArrayBuffer) {
      jsonResponse = Json.parse(this.text());
    } else {
      jsonResponse = this._body;
    }
    return jsonResponse;
  }

  /**
   * Returns the body as a string, presuming `toString()` can be called on the response body.
   */
  text(): string {
    var textResponse: string;
    if (this._body instanceof ArrayBuffer) {
      textResponse = String.fromCharCode.apply(null, new Uint16Array(<ArrayBuffer>this._body));
    } else if (isJsObject(this._body)) {
      textResponse = Json.stringify(this._body);
    } else {
      textResponse = this._body.toString();
    }
    return textResponse;
  }

  /**
   * Return the body as an ArrayBuffer
   */
  arrayBuffer(): ArrayBuffer {
    var bufferResponse: ArrayBuffer;
    if (this._body instanceof ArrayBuffer) {
      bufferResponse = <ArrayBuffer>this._body;
    } else {
      bufferResponse = stringToArrayBuffer(this.text());
    }
    return bufferResponse;
  }


  toString(): string {
    return `Response with status: ${this.status} ${this.statusText} for URL: ${this.url}`;
  }

  /**
   * Not yet implemented
   */
  // TODO: Blob return type
  blob(): any { throw new BaseException('"blob()" method not implemented on Response superclass'); }

}
