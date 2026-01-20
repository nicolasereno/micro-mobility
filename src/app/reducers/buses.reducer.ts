import {createReducer, on} from '@ngrx/store';
import {BusTimesInfo} from '../model/model';
import {BusesActions} from '../actions/buses.actions';

export const busesFeatureKey = 'buses';

export interface BusesState {
  stopCode: string | undefined;
  stopName: string | undefined;
  arrivals: BusTimesInfo[] | undefined;
}

export const initialState: BusesState = {
  stopCode: undefined,
  stopName: undefined,
  arrivals: undefined,
};

export const busesReducer = createReducer(
  initialState,
  on( BusesActions.loadBuses, ( state, action ) => ({
    ...state,
    stopCode: action.stopCode,
    stopName: undefined,
    arrivals: undefined
  }) ),
  on( BusesActions.loadBusesSuccess, ( state, action ) => ({
    ...state,
    stopName: action.times.stopName,
    arrivals: action.times.arrivals
  }) ),
  on( BusesActions.loadBusesFailure, ( state, action ) => ({
    ...state,
    stopCode: undefined,
  }) ),
  on( BusesActions.clearBuses, ( state, {} ) => ({
    ...state,
    stopCode: undefined,
    stopName: undefined,
    arrivals: undefined
  }) )
);

