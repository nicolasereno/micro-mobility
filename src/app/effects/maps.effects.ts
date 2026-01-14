import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {MapsActions} from '../actions/maps.actions';
import {fromLonLat} from 'ol/proj';


@Injectable()
export class MapsEffects {

  private actions$ = inject( Actions );

  loadLocation$ = createEffect( () =>
    this.actions$.pipe(
      ofType( MapsActions.getGPSPosition ),
      switchMap( () =>
        new Observable<GeolocationPosition>( observer => {
          navigator.geolocation.getCurrentPosition(
            position => {
              observer.next( position );
              observer.complete();
            },
            error => observer.error( error )
          );
        } ).pipe(
          map( position =>
            MapsActions.getGPSPositionSuccess( {
              coordinates: fromLonLat( [position.coords.longitude, position.coords.latitude] ),
              accuracy: position.coords.accuracy
            } )
          ),
          catchError( err =>
            of( MapsActions.getGPSPositionFailure() )
          )
        )
      )
    )
  );
}
