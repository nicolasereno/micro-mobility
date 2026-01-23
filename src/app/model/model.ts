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

export type BusTimesInfo = {
  lineCode: string;
  direction: string;
  atStart: boolean;
  distance: number | undefined;
  time: number | undefined;
  arriving: boolean;
}

export type BusStopTimesInfo = {
  stopCode: string;
  stopName: string;
  arrivals: BusTimesInfo[];
}
