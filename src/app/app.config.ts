import {ApplicationConfig, DOCUMENT, ErrorHandler, inject, isDevMode, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideStore} from '@ngrx/store';
import {metaReducers, reducers} from './reducers';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {provideEffects} from '@ngrx/effects';
import {HttpClient, provideHttpClient} from '@angular/common/http';
import {VehiclesEffects} from './effects/vehicles.effects';
import {MapsEffects} from './effects/maps.effects';
import {BusesEffects} from './effects/buses.effects';
import {provideServiceWorker} from '@angular/service-worker';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideStore( reducers, {metaReducers} ),
    provideStoreDevtools( {maxAge: 25, logOnly: !isDevMode()} ),
    provideEffects( VehiclesEffects, MapsEffects, BusesEffects ),
    provideServiceWorker( 'ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    } ),
    provideMatIconRegistry()
  ]
};

export function provideMatIconRegistry() {
  return {
    provide: MatIconRegistry, useFactory: () => {
      const http = inject( HttpClient );
      const sanitizer = inject( DomSanitizer );
      const document = inject( DOCUMENT );
      const errorHandler = inject( ErrorHandler );

      const iconRegistry = new MatIconRegistry( http, sanitizer, document, errorHandler );

      iconRegistry.addSvgIconSetInNamespace(
        'operators',
        sanitizer.bypassSecurityTrustResourceUrl( '/icons/operators.svg' )
      );
      iconRegistry.addSvgIconSetInNamespace(
        'vehicle-types',
        sanitizer.bypassSecurityTrustResourceUrl( '/icons/vehicle-types.svg' )
      );

      return iconRegistry;
    }
  }
}
