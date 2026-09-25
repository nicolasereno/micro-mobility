import {createReducer, on} from '@ngrx/store';
import {MapsActions} from '../actions/maps.actions';
import {Coordinate} from 'ol/coordinate';
import {fromLonLat} from 'ol/proj';
import {VehicleType} from '../model/model';

export const mapsFeatureKey = 'maps';

export interface MapsState {
  center: Coordinate;
  zoom: number;
  position: Coordinate | undefined;
  positionTimestamp: Date | undefined;
  accuracy: number | undefined;
  orientation: number | undefined;
  vehicleTypesVisible: Record<VehicleType, boolean>;
  zoomToPositionTime: number | undefined;
}

export const initialState: MapsState = {
  center: fromLonLat( [12.49637, 41.90278] ),
  zoom: 12,
  position: undefined,
  positionTimestamp: undefined,
  accuracy: undefined,
  orientation: undefined,
  vehicleTypesVisible: {bicycle: true, scooter: true},
  zoomToPositionTime: undefined,
};

export const mapsReducer = createReducer(
  initialState,
  on( MapsActions.changeMapPosition, ( state, {center, zoom} ) => ({
    ...state,
    center: center,
    zoom: zoom,
  }) ),
  on( MapsActions.zoomToPosition, ( state, {} ) => ({
    ...state,
    zoomToPositionTime: state.position ? new Date().getTime() : undefined,
  }) ),
  on( MapsActions.getGPSPositionSuccess, ( state, {coordinates, accuracy, timestamp} ) => ({
    ...state,
    position: coordinates,
    accuracy: accuracy,
    positionTimestamp: timestamp,
  }) ),
  on( MapsActions.getDeviceOrientationSuccess, ( state, {orientation} ) => ({
    ...state,
    orientation: orientation,
  }) ),
  on( MapsActions.toggleVehicleType, ( state, {vehicleType} ) => ({
    ...state,
    vehicleTypesVisible: {...state.vehicleTypesVisible, [vehicleType]: !state.vehicleTypesVisible[vehicleType]},
  }) ),
  on( MapsActions.resetGPSPosition, ( state, {} ) => ({
    ...state,
    position: undefined,
    accuracy: undefined,
    positionTimestamp: undefined
  }) ),
);

