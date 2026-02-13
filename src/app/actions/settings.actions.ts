import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const SettingsActions = createActionGroup( {
  source: 'Settings',
  events: {
    'Minimum Charge': props<{ minimumCharge: number }>(),
    'Follow GPS': emptyProps(),
    'Unfollow GPS': emptyProps(),
    'Change Theme': props<{ theme: 'light' | 'dark' }>(),
  }
} );
