import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, distinctUntilChanged, map, of, switchMap} from 'rxjs';
import {MapsActions} from '../actions/maps.actions';
import {fromLonLat} from 'ol/proj';
import {DevicePositioningService} from '../services/device-positioning';


@Injectable()
export class MapsEffects {

  private actions$ = inject( Actions );
  private devicePositioningService = inject( DevicePositioningService );

  loadLocation$ = createEffect( () =>
    this.actions$.pipe(
      ofType( MapsActions.getGPSPosition ),
      switchMap( () =>
        this.devicePositioningService.getPosition().pipe(
          map( position =>
            MapsActions.getGPSPositionSuccess( {
              coordinates: fromLonLat( [position.coords.longitude, position.coords.latitude] ),
              accuracy: position.coords.accuracy,
              timestamp: new Date()
            } )
          ),
          catchError( () =>
            of( MapsActions.getGPSPositionFailure() )
          )
        )
      )
    )
  );

  loadDeviceOrientation$ = createEffect( () =>
    this.actions$.pipe(
      ofType( MapsActions.getDeviceOrientation ),
      map( () => this.devicePositioningService.getHeading() ),
      distinctUntilChanged(),
      map( orientation => MapsActions.getDeviceOrientationSuccess( {orientation} ) )
    )
  );
}
