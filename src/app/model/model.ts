import {Coordinate} from 'ol/coordinate';

export type VehicleType = 'bicycle' | 'scooter';
export type SharingOperator = 'dott' | 'bird' | 'lime';

export type Vehicle = {
  id: string;
  operator: SharingOperator;
  vehicleType: VehicleType;
  percentageCharge: number;
  coordinates: Coordinate;
}

