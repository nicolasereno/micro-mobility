import {createReducer, on} from '@ngrx/store';
import {BusTimesInfo} from '../model/model';
import {BusesActions} from '../actions/buses.actions';

export const busesFeatureKey = 'buses';

export interface BusesState {
  stopCode: string | undefined;
  preferredStops: string[];
  stopName: string | undefined;
  arrivals: BusTimesInfo[] | undefined;
}

export const initialState: BusesState = {
  stopCode: undefined,
  preferredStops: [],
  stopName: undefined,
  arrivals: undefined,
};

export const busesReducer = createReducer(
  initialState,
  on(BusesActions.loadBuses, (state, action) => ({
    ...state,
    stopCode: action.stopCode,
    stopName: action.stopDescription,
    arrivals: undefined
  })),
  on(BusesActions.loadBusesSuccess, (state, action) => ({
    ...state,
    stopName: action.times.stopName,
    arrivals: action.times.arrivals
  })),
  on(BusesActions.loadBusesFailure, (state, _) => ({
    ...state,
    stopCode: undefined,
    stopName: undefined,
  })),
  on(BusesActions.clearBuses, (state, {}) => ({
    ...state,
    stopCode: undefined,
    stopName: undefined,
    arrivals: undefined
  })),
  on(BusesActions.addPreferredStop, (state, {stopCode}) => ({
    ...state,
    preferredStops: [...state.preferredStops.filter(sc => sc !== stopCode), stopCode]
  })),
  on(BusesActions.removePreferredStop, (state, {stopCode}) => ({
    ...state,
    preferredStops: state.preferredStops.filter(sc => sc !== stopCode)
  }))
);

