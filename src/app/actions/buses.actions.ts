import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {BusStop, BusStopTimesInfo, NearBusStop} from '../model/model';

export const BusesActions = createActionGroup( {
  source: 'Buses',
  events: {
    'Clear Buses': emptyProps(),
    'Load Buses': props<{ stop: BusStop }>(),
    'Load Buses Success': props<{ stop: BusStop, times: BusStopTimesInfo }>(),
    'Load Buses Failure': props<{ error: string }>(),
    'Refresh Buses': props<{ stop: BusStop }>(),
    'Add Preferred Stop': props<{ stop: BusStop }>(),
    'Remove Preferred Stop': props<{ stopId: string }>(),
    'Load Near Bus Stops': props<{ lon: number, lat: number }>(),
    'Load Near Bus Stops Success': props<{ nearStops: NearBusStop[] }>(),
    'Load Near Bus Stops Failure': props<{ error: string }>(),
    'Clear Near Bus Stops': emptyProps(),
  }
} );
