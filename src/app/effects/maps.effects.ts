import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {GeneralBikeShareFeed} from '../general-bike-share-feed';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {MapsActions} from '../actions/maps.actions';
import {fromLonLat} from 'ol/proj';


@Injectable()
export class MapsEffects {

  private actions$ = inject(Actions);
  private gbsfService = inject(GeneralBikeShareFeed);

  loadLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapsActions.zoomToPosition),
      switchMap(() =>
        new Observable<GeolocationPosition>(observer => {
          navigator.geolocation.getCurrentPosition(
            position => {
              observer.next(position);
              observer.complete();
            },
            error => observer.error(error)
          );
        }).pipe(
          map(position =>
            MapsActions.zoomToPositionSuccess({
              coordinates: fromLonLat([position.coords.longitude, position.coords.latitude])
            })
          ),
          catchError(err =>
            of(MapsActions.zoomToPositionFailure())
          )
        )
      )
    )
  );
}
