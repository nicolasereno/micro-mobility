import {ActionReducer, ActionReducerMap, INIT, MetaReducer, UPDATE} from '@ngrx/store';
import {vehiclesFeatureKey, vehiclesReducer, VehiclesState} from './vehicles.reducer';
import {mapsFeatureKey, mapsReducer, MapsState} from './maps.reducer';
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
export const positionAvailable = ( state: AppState ) => state[mapsFeatureKey].position !== undefined;
export const accuracy = ( state: AppState ) => state[mapsFeatureKey].accuracy;
export const zoomToPositionTime = ( state: AppState ) => state[mapsFeatureKey].zoomToPositionTime;
export const minimumCharge = ( state: AppState ) => state[mapsFeatureKey].minimumCharge;
export const allVehicles = ( state: AppState ) => state[vehiclesFeatureKey].vehicles;
export const operatorsVisible = ( state: AppState ) => state[vehiclesFeatureKey].vehiclesVisible;
export const operatorsError = ( state: AppState ) => state[vehiclesFeatureKey].vehiclesError;
export const stopCode = ( state: AppState ) => state[busesFeatureKey].stopCode;
export const stopName = ( state: AppState ) => state[busesFeatureKey].stopName;
export const busWaitTimes = ( state: AppState ) => state[busesFeatureKey].arrivals;
export const selectedVehicle = ( state: AppState ) => state[vehiclesFeatureKey].selectedVehicle;
export const selectedVehicleId = ( state: AppState ) => state[vehiclesFeatureKey].selectedVehicle?.id;
export const vehicleTypesVisible = ( state: AppState ) => state[mapsFeatureKey].vehicleTypesVisible;
export const center = ( state: AppState ) => state[mapsFeatureKey].center;
export const zoom = ( state: AppState ) => state[mapsFeatureKey].zoom;

export const metaReducers: MetaReducer<AppState>[] = [ storageMetaReducer ];

export function storageMetaReducer(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {
  return (state, action) => {
    const STORAGE_KEY = 'micro-mobility-data';

    // 🔄 Restore state on app startup
    if (action.type === INIT || action.type === UPDATE) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...state??{}, ...JSON.parse(stored) };
        } catch {}
      }
    }

    // Run normal reducers
    const nextState = reducer(state, action);

    // 💾 Persist only selected slices
    if (nextState) {
      const mapSliceToStore = {
        [vehiclesFeatureKey]: {
          vehiclesVisible: nextState[vehiclesFeatureKey].vehiclesVisible
        },
        [busesFeatureKey]: {},
        [mapsFeatureKey]: {
          center: nextState[mapsFeatureKey].center,
          zoom: nextState[mapsFeatureKey].zoom,
          vehicleTypesVisible: nextState[mapsFeatureKey].vehicleTypesVisible,
          minimumCharge: nextState[mapsFeatureKey].minimumCharge
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapSliceToStore));
    }

    return nextState;
  };
}
