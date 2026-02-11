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
  accuracy: number | undefined;
  vehicleTypesVisible: Record<VehicleType, boolean>;
  minimumCharge: number;
  zoomToPositionTime: number | undefined;
  followGps: boolean;
}

export const initialState: MapsState = {
  center: fromLonLat( [12.49637, 41.90278] ),
  zoom: 12,
  position: undefined,
  accuracy: undefined,
  vehicleTypesVisible: {bicycle: true, scooter: true},
  minimumCharge: 10,
  zoomToPositionTime: undefined,
  followGps: false,
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
  on( MapsActions.getGPSPositionSuccess, ( state, {coordinates, accuracy} ) => ({
    ...state,
    position: coordinates,
    accuracy: accuracy,
  }) ),
  on( MapsActions.toggleVehicleType, ( state, {vehicleType} ) => ({
    ...state,
    vehicleTypesVisible: {...state.vehicleTypesVisible, [vehicleType]: !state.vehicleTypesVisible[vehicleType]},
  }) ),
  on( MapsActions.minimumCharge, ( state, {minimumCharge} ) => ({
    ...state,
    minimumCharge: minimumCharge,
  }) ),
  on( MapsActions.followGPS, ( state, {} ) => ({
    ...state,
    followGps: true,
  }) ),
  on( MapsActions.unfollowGPS, ( state, {} ) => ({
    ...state,
    followGps: false,
  }) )
);

