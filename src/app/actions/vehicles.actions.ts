import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {SharingOperator, Vehicle} from '../model/model';

export const VehiclesActions = createActionGroup( {
  source: 'Vehicles',
  events: {
    'Load Vehicles': props<{ operator: SharingOperator }>(),
    'Load Vehicles Success': props<{ operator: SharingOperator, vehicles: Vehicle[] }>(),
    'Load Vehicles Failure': props<{ operator: SharingOperator, error: string }>(),
    'Toggle Operator': props<{ operator: SharingOperator }>(),
    'Select Vehicle': props<{ id: string, operator: SharingOperator }>(),
    'Unselect Vehicle': emptyProps(),
  }
} );
