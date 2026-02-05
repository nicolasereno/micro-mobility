import {createReducer, on} from '@ngrx/store';
import {SHARING_OPERATORS, SharingOperator, Vehicle} from '../model/model';
import {VehiclesActions} from '../actions/vehicles.actions';

export const vehiclesFeatureKey = 'vehicles';

export interface VehiclesState {
  vehicles: Record<SharingOperator, Vehicle[]>;
  vehiclesVisible: Record<SharingOperator, boolean>;
  vehiclesError: Record<SharingOperator, boolean>;
  selectedVehicle: Vehicle | undefined;
  error: string | null
}

export const initialState: VehiclesState = {
  vehicles: Object.fromEntries(
    SHARING_OPERATORS.map( op => [op, []] )
  ) as Record<SharingOperator, []>,
  vehiclesVisible: Object.fromEntries(
    SHARING_OPERATORS.map( op => [op, true] )
  ) as Record<SharingOperator, boolean>,
  vehiclesError: Object.fromEntries(
    SHARING_OPERATORS.map( op => [op, false] )
  ) as Record<SharingOperator, boolean>,
  selectedVehicle: undefined,
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
    },
    vehiclesError: {
      ...state.vehiclesError,
      [operator]: false
    }
  }) ),
  on( VehiclesActions.loadVehiclesFailure, ( state, {operator, error} ) => ({
    ...state,
    vehiclesError: {
      ...state.vehiclesError,
      [operator]: true
    },
    error: error
  }) ),
  on( VehiclesActions.toggleOperator, ( state, {operator} ) => ({
    ...state,
    vehiclesVisible: {
      ...state.vehiclesVisible,
      [operator]: !state.vehiclesVisible[operator]
    }
  }) ),
  on( VehiclesActions.selectVehicle, ( state, {id, operator} ) => ({
    ...state,
    selectedVehicle: state.vehicles[operator].find( v => v.id === id ) ?? undefined
  }) ),
  on( VehiclesActions.unselectVehicle, ( state, {} ) => ({
    ...state,
    selectedVehicle: undefined
  }) )
);

