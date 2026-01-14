import {createReducer, on} from '@ngrx/store';
import {MapsActions} from '../actions/maps.actions';
import {Coordinate} from 'ol/coordinate';
import {fromLonLat} from 'ol/proj';

export const mapsFeatureKey = 'maps';

export interface MapsState {
  center: Coordinate;
  zoom: number;
  position: Coordinate | undefined;
  accuracy: number | undefined;
  bicycleVisible: boolean;
  scooterVisible: boolean;
  minimumCharge: number;
}

export const initialState: MapsState = {
  center: fromLonLat( [12.49637, 41.90278] ),
  zoom: 12,
  position: undefined,
  accuracy: undefined,
  bicycleVisible: true,
  scooterVisible: true,
  minimumCharge: 10
};

export const mapsReducer = createReducer(
  initialState,
  on( MapsActions.zoomToPosition, ( state, {} ) => ({
    ...state,
    center: state.position ?? state.center,
    zoom: state.accuracy ? 18 : state.zoom,
  }) ),
  on( MapsActions.getGPSPositionSuccess, ( state, {coordinates, accuracy} ) => ({
    ...state,
    position: coordinates,
    accuracy: accuracy,
  }) ),
  on( MapsActions.toggleBicycle, ( state, {} ) => ({
    ...state,
    bicycleVisible: !state.bicycleVisible,
  }) ),
  on( MapsActions.toggleScooter, ( state, {} ) => ({
    ...state,
    scooterVisible: !state.scooterVisible,
  }) ),
  on( MapsActions.minimumCharge, ( state, {minimumCharge} ) => ({
    ...state,
    minimumCharge: minimumCharge,
  }) )
);

