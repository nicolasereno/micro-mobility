import {createReducer, on} from '@ngrx/store';
import {SettingsActions} from '../actions/settings.actions';

export const settingsFeatureKey = 'settings';

export interface SettingsState {
  minimumCharge: number;
  minimumDistance: number;
  followGps: boolean;
  theme: 'light' | 'dark';
}

export const initialState: SettingsState = {
  minimumCharge: 10,
  minimumDistance: 3,
  followGps: false,
  theme: 'light',
};

export const settingsReducer = createReducer(
  initialState,
  on( SettingsActions.changeTheme, ( state, {theme} ) => ({...state, theme}) ),
  on( SettingsActions.minimumCharge, ( state, {minimumCharge} ) => ({
    ...state,
    minimumCharge: minimumCharge,
  }) ),
  on( SettingsActions.minimumDistance, ( state, {minimumDistance} ) => ({
    ...state,
    minimumDistance: minimumDistance,
  }) ),
  on( SettingsActions.followGPS, ( state, {} ) => ({
    ...state,
    followGps: true,
  }) ),
  on( SettingsActions.unfollowGPS, ( state, {} ) => ({
    ...state,
    followGps: false,
  }) )
);

