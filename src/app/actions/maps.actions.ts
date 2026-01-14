import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Coordinate} from 'ol/coordinate';

export const MapsActions = createActionGroup({
  source: 'Maps',
  events: {
    'Zoom To Position': emptyProps(),
    'Get GPS Position': emptyProps(),
    'Get GPS Position Success': props<{ coordinates: Coordinate, accuracy: number }>(),
    'Get GPS Position Failure': emptyProps(),
    'Toggle Bicycle': emptyProps(),
    'Toggle Scooter': emptyProps(),
    'Minimum Charge': props<{ minimumCharge: number }>(),
  }
});
