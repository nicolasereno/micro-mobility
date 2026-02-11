import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Coordinate} from 'ol/coordinate';
import {VehicleType} from '../model/model';

export const MapsActions = createActionGroup( {
  source: 'Maps',
  events: {
    'Zoom To Position': emptyProps(),
    'Get GPS Position': emptyProps(),
    'Get GPS Position Success': props<{ coordinates: Coordinate, accuracy: number }>(),
    'Get GPS Position Failure': emptyProps(),
    'Change Map Position': props<{ center: Coordinate, zoom: number }>(),
    'Toggle Vehicle Type': props<{ vehicleType: VehicleType }>(),
    'Minimum Charge': props<{ minimumCharge: number }>(),
    'Follow GPS': emptyProps(),
    'Unfollow GPS': emptyProps(),
  }
} );
