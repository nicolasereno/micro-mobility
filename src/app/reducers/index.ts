import {ActionReducer, ActionReducerMap, INIT, MetaReducer, UPDATE} from '@ngrx/store';
import {vehiclesFeatureKey, vehiclesReducer, VehiclesState} from './vehicles.reducer';
import {mapsFeatureKey, mapsReducer, MapsState} from './maps.reducer';
import {busesFeatureKey, busesReducer, BusesState} from './buses.reducer';
import {settingsFeatureKey, settingsReducer, SettingsState} from './settings.reducer';

export interface AppState {
  [settingsFeatureKey]: SettingsState,
  [vehiclesFeatureKey]: VehiclesState;
  [mapsFeatureKey]: MapsState;
  [busesFeatureKey]: BusesState;
}

export const reducers: ActionReducerMap<AppState> = {
  [settingsFeatureKey]: settingsReducer,
  [vehiclesFeatureKey]: vehiclesReducer,
  [mapsFeatureKey]: mapsReducer,
  [busesFeatureKey]: busesReducer,
};

export const position = ( state: AppState ) => state[mapsFeatureKey].position;
export const positionAvailable = ( state: AppState ) => state[mapsFeatureKey].position !== undefined;
export const accuracy = ( state: AppState ) => state[mapsFeatureKey].accuracy;
export const zoomToPositionTime = ( state: AppState ) => state[mapsFeatureKey].zoomToPositionTime;
export const minimumCharge = ( state: AppState ) => state[settingsFeatureKey].minimumCharge;
export const minimumDistance = ( state: AppState ) => state[settingsFeatureKey].minimumDistance;
export const allVehicles = ( state: AppState ) => state[vehiclesFeatureKey].vehicles;
export const operatorsVisible = ( state: AppState ) => state[vehiclesFeatureKey].vehiclesVisible;
export const operatorsError = ( state: AppState ) => state[vehiclesFeatureKey].vehiclesError;
export const stop = ( state: AppState ) => state[busesFeatureKey].stop;
export const busWaitTimes = ( state: AppState ) => state[busesFeatureKey].arrivals;
export const nearStops = ( state: AppState ) => state[busesFeatureKey].nearStops;
export const selectedVehicle = ( state: AppState ) => state[vehiclesFeatureKey].selectedVehicle;
export const selectedVehicleId = ( state: AppState ) => state[vehiclesFeatureKey].selectedVehicle?.id;
export const vehicleTypesVisible = ( state: AppState ) => state[mapsFeatureKey].vehicleTypesVisible;
export const center = ( state: AppState ) => state[mapsFeatureKey].center;
export const zoom = ( state: AppState ) => state[mapsFeatureKey].zoom;
export const preferredStops = ( state: AppState ) => state[busesFeatureKey].preferredStops;
export const followGps = ( state: AppState ) => state[settingsFeatureKey].followGps;
export const theme = ( state: AppState ) => state[settingsFeatureKey].theme;

export const metaReducers: MetaReducer<AppState>[] = [storageMetaReducer];

export function storageMetaReducer(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {
  return ( state, action ) => {
    const STORAGE_KEY = 'micro-mobility-data';

    // 🔄 Restore state on app startup
    if ( action.type === INIT || action.type === UPDATE ) {
      const stored = localStorage.getItem( STORAGE_KEY );
      if ( stored ) {
        try {
          return {...state ?? {}, ...JSON.parse( stored )};
        } catch {
        }
      }
    }

    // Run normal reducers
    const nextState = reducer( state, action );

    // 💾 Persist only selected slices
    if ( nextState ) {
      const mapSliceToStore = {
        [settingsFeatureKey]: {
          minimumCharge: nextState[settingsFeatureKey].minimumCharge,
          minimumDistance: nextState[settingsFeatureKey].minimumDistance,
          followGps: nextState[settingsFeatureKey].followGps,
          theme: nextState[settingsFeatureKey].theme
        },
        [vehiclesFeatureKey]: {
          vehiclesVisible: nextState[vehiclesFeatureKey].vehiclesVisible
        },
        [busesFeatureKey]: {
          preferredStops: nextState[busesFeatureKey].preferredStops ?? [],
        },
        [mapsFeatureKey]: {
          center: nextState[mapsFeatureKey].center,
          zoom: nextState[mapsFeatureKey].zoom,
          vehicleTypesVisible: nextState[mapsFeatureKey].vehicleTypesVisible,
        },
      };
      localStorage.setItem( STORAGE_KEY, JSON.stringify( mapSliceToStore ) );
    }

    return nextState;
  };
}
