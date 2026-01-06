import {isDevMode} from '@angular/core';
import {ActionReducerMap, createSelector, MetaReducer} from '@ngrx/store';
import {vehiclesFeatureKey, vehiclesReducer, VehiclesState} from './vehicles.reducer';
import {mapsFeatureKey, mapsReducer, MapsState} from './maps.reducer';
import {SharingOperator} from '../model/model';

export interface AppState {
  [vehiclesFeatureKey]: VehiclesState;
  [mapsFeatureKey]: MapsState;
}

export const reducers: ActionReducerMap<AppState> = {
  [vehiclesFeatureKey]: vehiclesReducer,
  [mapsFeatureKey]: mapsReducer,
};

export const allVehicles = (state: AppState) => state.vehicles.vehicles;
export const mapCenter = (state: AppState) => state.maps.center;
export const mapZoom = (state: AppState) => state.maps.zoom;
export const bicycleVisible = (state: AppState) => state.maps.bicycleVisible;
export const scooterVisible = (state: AppState) => state.maps.scooterVisible;
export const operatorsVisible = (state: AppState) => state.vehicles.vehiclesVisible;
export const minimumCharge = (state: AppState) => state.maps.minimumCharge;

export const operatorVisible = (operator: SharingOperator) =>
  createSelector(
    operatorsVisible,
    operators => operators[operator]
  );
export const metaReducers: MetaReducer<AppState>[] = isDevMode() ? [] : [];
