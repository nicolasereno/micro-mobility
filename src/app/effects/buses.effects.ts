import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {BusStopTimes} from '../services/bus-stop-times';
import {catchError, map, mergeMap, of} from 'rxjs';
import {BusesActions} from '../actions/buses.actions';


@Injectable()
export class BusesEffects {

  private actions$ = inject( Actions );
  private busStopTimesService = inject( BusStopTimes );

  loadStopTimes$ = createEffect( () => {
    return this.actions$.pipe(
      ofType( BusesActions.loadBuses ),
      mergeMap( action =>
        this.busStopTimesService.loadBusStopTimes( action.stop.stopId, action.stop.description ).pipe(
          map( info => BusesActions.loadBusesSuccess( {
            stop: action.stop,
            times: info
          } ) ),
          catchError( () => of( BusesActions.loadBusesFailure( {
            error: ''
          } ) ) )
        )
      )
    )
  } )

  refreshStopTimes$ = createEffect( () => {
    return this.actions$.pipe(
      ofType( BusesActions.refreshBuses ),
      mergeMap( action =>
        this.busStopTimesService.loadBusStopTimes( action.stop.stopId, action.stop.description ).pipe(
          map( info => BusesActions.loadBusesSuccess( {
            stop: action.stop,
            times: info
          } ) ),
          catchError( () => of( BusesActions.loadBusesFailure( {
            error: ''
          } ) ) )
        )
      )
    )
  } )

  loadNearStops$ = createEffect( () => {
    return this.actions$.pipe(
      ofType( BusesActions.loadNearBusStops ),
      mergeMap( action =>
        this.busStopTimesService.searchNearestStops( action.lon, action.lat ).pipe(
          map( nearStops => BusesActions.loadNearBusStopsSuccess( {
            nearStops: nearStops
          } ) ),
          catchError( () => of( BusesActions.loadNearBusStopsFailure( {
            error: ''
          } ) ) )
        )
      )
    )
  } )
}
