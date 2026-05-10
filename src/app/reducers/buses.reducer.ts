import {createReducer, on} from '@ngrx/store';
import {BusStop, BusTimesInfo, NearBusStop} from '../model/model';
import {BusesActions} from '../actions/buses.actions';

export const busesFeatureKey = 'buses';

export interface BusesState {
  stop: BusStop | undefined;
  preferredStops: BusStop[];
  nearStops: NearBusStop[] | undefined;
  arrivals: BusTimesInfo[] | undefined;
}

export const initialState: BusesState = {
  stop: undefined,
  preferredStops: [],
  nearStops: undefined,
  arrivals: undefined,
};

export const busesReducer = createReducer(
  initialState,
  on( BusesActions.loadBuses, ( state, action ) => ({
    ...state,
    stop: action.stop,
    arrivals: undefined
  }) ),
  on( BusesActions.loadBusesSuccess, ( state, action ) => ({
    ...state,
    stop: action.times.stop,
    arrivals: action.times.arrivals
  }) ),
  on( BusesActions.loadBusesFailure, ( state, _ ) => ({
    ...state,
    stop: undefined,
  }) ),
  on( BusesActions.clearBuses, ( state, {} ) => ({
    ...state,
    stop: undefined,
    arrivals: undefined
  }) ),
  on( BusesActions.addPreferredStop, ( state, {stop} ) => ({
    ...state,
    preferredStops: [...state.preferredStops.filter( sc => sc.stopId !== stop.stopId ), stop]
  }) ),
  on( BusesActions.removePreferredStop, ( state, {stopId} ) => ({
    ...state,
    preferredStops: state.preferredStops.filter( sc => sc.stopId !== stopId )
  }) ),
  on( BusesActions.clearNearBusStops, ( state, {} ) => ({
    ...state,
    nearStops: undefined
  }) ),
  on( BusesActions.loadNearBusStops, ( state, {} ) => ({
    ...state,
    nearStops: undefined
  }) ),
  on( BusesActions.loadNearBusStopsSuccess, ( state, {nearStops} ) => ({
    ...state,
    nearStops: nearStops
  }) ),
  on( BusesActions.loadNearBusStopsFailure, ( state, _ ) => ({
    ...state,
    nearStops: undefined,
  }) ),
);

