import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {BusStopTimesInfo} from '../model/model';

export const BusesActions = createActionGroup( {
  source: 'Buses',
  events: {
    'Clear Buses': emptyProps(),
    'Load Buses': props<{ stopCode: string }>(),
    'Load Buses Success': props<{ times: BusStopTimesInfo }>(),
    'Load Buses Failure': props<{ error: string }>(),
  }
} );
