import {isDevMode} from '@angular/core';
import {ActionReducerMap, createSelector, MetaReducer} from '@ngrx/store';
import {vehiclesFeatureKey, vehiclesReducer, VehiclesState} from './vehicles.reducer';
import {mapsFeatureKey, mapsReducer, MapsState} from './maps.reducer';
import {SharingOperator} from '../model/model';
import {busesFeatureKey, busesReducer, BusesState} from './buses.reducer';

export interface AppState {
  [vehiclesFeatureKey]: VehiclesState;
  [mapsFeatureKey]: MapsState;
  [busesFeatureKey]: BusesState;
}

export const reducers: ActionReducerMap<AppState> = {
  [vehiclesFeatureKey]: vehiclesReducer,
  [mapsFeatureKey]: mapsReducer,
  [busesFeatureKey]: busesReducer,
};

export const position = ( state: AppState ) => state[mapsFeatureKey].position;
export const accuracy = ( state: AppState ) => state[mapsFeatureKey].accuracy;
export const mapCenter = ( state: AppState ) => state[mapsFeatureKey].center;
export const mapZoom = ( state: AppState ) => state[mapsFeatureKey].zoom;
export const bicycleVisible = ( state: AppState ) => state[mapsFeatureKey].bicycleVisible;
export const scooterVisible = ( state: AppState ) => state[mapsFeatureKey].scooterVisible;
export const minimumCharge = ( state: AppState ) => state[mapsFeatureKey].minimumCharge;
export const allVehicles = ( state: AppState ) => state[vehiclesFeatureKey].vehicles;
export const operatorsVisible = ( state: AppState ) => state[vehiclesFeatureKey].vehiclesVisible;
export const stopCode = ( state: AppState ) => state[busesFeatureKey].stopCode;
export const stopName = ( state: AppState ) => state[busesFeatureKey].stopName;
export const busWaitTimes = ( state: AppState ) => state[busesFeatureKey].arrivals;
export const selectedVehicle = ( state: AppState ) => state[vehiclesFeatureKey].selectedVehicle;

export const operatorVisible = ( operator: SharingOperator ) =>
  createSelector(
    operatorsVisible,
    operators => operators[operator]
  );
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
