import {Coordinate} from 'ol/coordinate';

export const SHARING_OPERATORS = ['dott', 'lime', 'bird'] as const;

export const OPERATORS_OPEN_LINK: ( vehicle: Vehicle ) => Record<SharingOperator, string> = vehicle => ({
  bird: `https://play.google.com/store/apps/details?id=co.bird.android`,
  lime: `limebike://map?selected_vehicle_id=${vehicle.id}`,
  dott: `https://go.ridedott.com/vehicles/${vehicle.id}?platform=android`
});

export const GBFS_URLS: Record<SharingOperator, string> = {
  dott: 'https://gbfs.api.ridedott.com/public/v2/rome/gbfs.json',
  bird: 'https://mds.bird.co/gbfs/v2/public/rome/gbfs.json',
  lime: 'https://data.lime.bike/api/partners/v2/gbfs/rome/gbfs.json'
};

export const PRIMARY_COLORS: Record<SharingOperator, string> = {
  lime: '#C0F008',
  bird: '#CED7E0',
  dott: '#00A8E9'
};
export const SECONDARY_COLORS: Record<SharingOperator, string> = {
  lime: '#08DE08',
  bird: '#2DCFF1',
  dott: '#E0120A'
};

export type SharingOperator = typeof SHARING_OPERATORS[number];

export type VehicleType = 'bicycle' | 'scooter';

export type Vehicle = {
  id: string;
  operator: SharingOperator;
  vehicleType: VehicleType;
  percentageCharge: number;
  estimatedDistance: number;
  coordinates: Coordinate;
  rentalUri: string | undefined;
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
