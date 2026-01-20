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
  vehicleNumber: string;
  direction: string;
  atStart: boolean;
  distance: number;
  time: number;
  arriving: boolean;
}

export type BusStopTimesInfo = {
  stopCode: string;
  stopName: string;
  arrivals: BusTimesInfo[];
}
