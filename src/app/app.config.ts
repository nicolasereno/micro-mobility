import {ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideStore} from '@ngrx/store';
import {metaReducers, reducers} from './reducers';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {provideEffects} from '@ngrx/effects';
import {provideHttpClient} from '@angular/common/http';
import {VehiclesEffects} from './effects/vehicles.effects';
import {MapsEffects} from './effects/maps.effects';
import {BusesEffects} from './effects/buses.effects';
import {provideServiceWorker} from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideStore(reducers, {metaReducers}),
    provideStoreDevtools({maxAge: 25, logOnly: !isDevMode()}),
    provideEffects(VehiclesEffects, MapsEffects, BusesEffects),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
