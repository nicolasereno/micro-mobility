import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {GeneralBikeShareFeed} from '../general-bike-share-feed';
import {VehiclesActions} from '../actions/vehicles.actions';
import {catchError, map, mergeMap, of} from 'rxjs';


@Injectable()
export class VehiclesEffects {

  private actions$ = inject(Actions);
  private gbsfService = inject(GeneralBikeShareFeed);

  loadVehicles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(VehiclesActions.loadVehicles),
      mergeMap(action =>
        this.gbsfService.loadOperatorVehicles(action.operator).pipe(
          map(vehicles => VehiclesActions.loadVehiclesSuccess({
            operator: action.operator, vehicles: vehicles
          })),
          catchError(error => of(VehiclesActions.loadVehiclesFailure({
            operator: action.operator, error: ''
          })))
        )
      )
    )
  })
}
