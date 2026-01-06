import {createReducer, on} from '@ngrx/store';
import {MapsActions} from '../actions/maps.actions';
import {Coordinate} from 'ol/coordinate';
import {fromLonLat} from 'ol/proj';

export const mapsFeatureKey = 'maps';

export interface MapsState {
  center: Coordinate;
  zoom: number;
  bicycleVisible: boolean;
  scooterVisible: boolean;
  minimumCharge: number;
}

export const initialState: MapsState = {
  center: fromLonLat([12.49637, 41.90278]),
  zoom: 12,
  bicycleVisible: true,
  scooterVisible: true,
  minimumCharge: 10
};

export const mapsReducer = createReducer(
  initialState,
  on(MapsActions.zoomToPositionSuccess, (state, {coordinates}) => ({
    ...state,
    zoom: 18,
    center: coordinates,
  })),
  on(MapsActions.toggleBicycle, (state, {}) => ({
    ...state,
    bicycleVisible: !state.bicycleVisible,
  })),
  on(MapsActions.toggleScooter, (state, {}) => ({
    ...state,
    scooterVisible: !state.scooterVisible,
  })),
  on(MapsActions.minimumCharge, (state, {minimumCharge}) => ({
    ...state,
    minimumCharge: minimumCharge,
  }))
);

