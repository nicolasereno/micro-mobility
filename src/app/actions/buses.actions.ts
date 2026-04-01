import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {BusStop, BusStopTimesInfo} from '../model/model';

export const BusesActions = createActionGroup( {
  source: 'Buses',
  events: {
    'Clear Buses': emptyProps(),
    'Load Buses': props<{ stop: BusStop }>(),
    'Load Buses Success': props<{ times: BusStopTimesInfo }>(),
    'Load Buses Failure': props<{ error: string }>(),
    'Refresh Buses': props<{ stop: BusStop }>(),
    'Add Preferred Stop': props<{ stop: BusStop }>(),
    'Remove Preferred Stop': props<{ stopId: string }>(),
  }
} );
