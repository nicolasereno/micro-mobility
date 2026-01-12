import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Coordinate} from 'ol/coordinate';

export const MapsActions = createActionGroup({
  source: 'Maps',
  events: {
    'Load Mapss': emptyProps(),
    'Zoom To Position': emptyProps(),
    'Zoom To Position Success': props<{ coordinates: Coordinate, accuracy: number }>(),
    'Zoom To Position Failure': emptyProps(),
    'Toggle Bicycle': emptyProps(),
    'Toggle Scooter': emptyProps(),
    'Minimum Charge': props<{ minimumCharge: number }>(),
  }
});
