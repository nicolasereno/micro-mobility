import {createReducer, on} from '@ngrx/store';
import {BusStop, BusTimesInfo} from '../model/model';
import {BusesActions} from '../actions/buses.actions';

export const busesFeatureKey = 'buses';

export interface BusesState {
  stop: BusStop | undefined;
  preferredStops: BusStop[];
  arrivals: BusTimesInfo[] | undefined;
}

export const initialState: BusesState = {
  stop: undefined,
  preferredStops: [],
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
    preferredStops: [...state.preferredStops.filter( sc => sc.stopId !== stop.stopId && sc.stopId! ), stop]
  }) ),
  on( BusesActions.removePreferredStop, ( state, {stopId} ) => ({
    ...state,
    preferredStops: state.preferredStops.filter( sc => sc.stopId !== stopId )
  }) )
);

