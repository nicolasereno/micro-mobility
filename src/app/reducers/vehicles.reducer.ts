import {createReducer, on} from '@ngrx/store';
import {SharingOperator, Vehicle} from '../model/model';
import {VehiclesActions} from '../actions/vehicles.actions';

export const vehiclesFeatureKey = 'vehicles';

export interface VehiclesState {
  vehicles: Record<SharingOperator, Vehicle[]>;
  vehiclesVisible: Record<SharingOperator, boolean>;
  error: string | null
}

export const initialState: VehiclesState = {
  vehicles: {
    'dott': [], 'lime': [], 'bird': []
  },
  vehiclesVisible: {
    'dott': true, 'lime': true, 'bird': true
  },
  error: null,
};

export const vehiclesReducer = createReducer(
  initialState,
  on( VehiclesActions.loadVehicles, ( state, {operator} ) => ({
    ...state,
    vehicles: {
      ...state.vehicles,
      [operator]: []
    },
    error: null
  }) ),
  on( VehiclesActions.loadVehiclesSuccess, ( state, {operator, vehicles} ) => ({
    ...state,
    vehicles: {
      ...state.vehicles,
      [operator]: vehicles
    }
  }) ),
  on( VehiclesActions.loadVehiclesFailure, ( state, {operator, error} ) => ({
    ...state,
    error: error
  }) ),
  on( VehiclesActions.toggleOperator, ( state, {operator} ) => ({
    ...state,
    vehiclesVisible: {
      ...state.vehiclesVisible,
      [operator]: !state.vehiclesVisible[operator]
    }
  }) )
);

