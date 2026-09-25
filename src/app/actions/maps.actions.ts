import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Coordinate} from 'ol/coordinate';
import {VehicleType} from '../model/model';

export const MapsActions = createActionGroup( {
  source: 'Maps',
  events: {
    'Zoom To Position': emptyProps(),
    'Get GPS Position': emptyProps(),
    'Reset GPS Position': emptyProps(),
    'Get GPS Position Success': props<{ coordinates: Coordinate, accuracy: number, timestamp: Date }>(),
    'Get GPS Position Failure': emptyProps(),
    'Get Device Orientation': emptyProps(),
    'Get Device Orientation Success': props<{ orientation: number | undefined }>(),
    'Change Map Position': props<{ center: Coordinate, zoom: number }>(),
    'Toggle Vehicle Type': props<{ vehicleType: VehicleType }>(),
  }
} );
