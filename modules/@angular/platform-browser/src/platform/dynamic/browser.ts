import {
  reflector,
  ReflectiveInjector,
  coreLoadAndBootstrap,
  Type,
  ComponentRef
} from '@angular/core';

import {COMPILER_PROVIDERS, XHR} from '@angular/compiler';
import {CachedXHR} from '../../../src/xhr/xhr_cache';
import {isPresent} from '../../../src/facade/lang';
import {XHRImpl} from '../../../src/xhr/xhr_impl';
import {browserPlatform, BROWSER_APP_COMMON_PROVIDERS} from '../common/browser';

import {ReflectionCapabilities} from '../../../core_private';

export const CACHED_TEMPLATE_PROVIDER: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[{provide: XHR, useClass: CachedXHR}];

/**
 * An array of providers that should be passed into `application()` when bootstrapping a component.
 */
export const BROWSER_APP_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      BROWSER_APP_COMMON_PROVIDERS,
      COMPILER_PROVIDERS,
      {provide: XHR, useClass: XHRImpl},
    ];

/**
 * Bootstrapping for Angular applications.
 *
 * You instantiate an Angular application by explicitly specifying a component to use
 * as the root component for your application via the `bootstrap()` method.
 *
 * ## Simple Example
 *
 * Assuming this `index.html`:
 *
 * ```html
 * <html>
 *   <!-- load Angular script tags here. -->
 *   <body>
 *     <my-app>loading...</my-app>
 *   </body>
 * </html>
 * ```
 *
 * An application is bootstrapped inside an existing browser DOM, typically `index.html`.
 * Unlike Angular 1, Angular 2 does not compile/process providers in `index.html`. This is
 * mainly for security reasons, as well as architectural changes in Angular 2. This means
 * that `index.html` can safely be processed using server-side technologies such as
 * providers. Bindings can thus use double-curly `{{ syntax }}` without collision from
 * Angular 2 component double-curly `{{ syntax }}`.
 *
 * We can use this script code:
 *
 * {@example core/ts/bootstrap/bootstrap.ts region='bootstrap'}
 *
 * When the app developer invokes `bootstrap()` with the root component `MyApp` as its
 * argument, Angular performs the following tasks:
 *
 *  1. It uses the component's `selector` property to locate the DOM element which needs
 *     to be upgraded into the angular component.
 *  2. It creates a new child injector (from the platform injector). Optionally, you can
 *     also override the injector configuration for an app by invoking `bootstrap` with the
 *     `customProviders` argument.
 *  3. It creates a new `Zone` and connects it to the angular application's change detection
 *     domain instance.
 *  4. It creates an emulated or shadow DOM on the selected component's host element and loads the
 *     template into it.
 *  5. It instantiates the specified component.
 *  6. Finally, Angular performs change detection to apply the initial data providers for the
 *     application.
 *
 *
 * ## Bootstrapping Multiple Applications
 *
 * When working within a browser window, there are many singleton resources: cookies, title,
 * location, and others. Angular services that represent these resources must likewise be
 * shared across all Angular applications that occupy the same browser window. For this
 * reason, Angular creates exactly one global platform object which stores all shared
 * services, and each angular application injector has the platform injector as its parent.
 *
 * Each application has its own private injector as well. When there are multiple
 * applications on a page, Angular treats each application injector's services as private
 * to that application.
 *
 * ## API
 *
 * - `appComponentType`: The root component which should act as the application. This is
 *   a reference to a `Type` which is annotated with `@Component(...)`.
 * - `customProviders`: An additional set of providers that can be added to the
 *   app injector to override default injection behavior.
 *
 * Returns a `Promise` of {@link ComponentRef}.
 */
export function bootstrap(
    appComponentType: Type,
    customProviders?: Array<any /*Type | Provider | any[]*/>): Promise<ComponentRef<any>> {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var appInjector = ReflectiveInjector.resolveAndCreate(
      [BROWSER_APP_PROVIDERS, isPresent(customProviders) ? customProviders : []],
      browserPlatform().injector);
  return coreLoadAndBootstrap(appInjector, appComponentType);
}
