import {inject, Injectable} from '@angular/core';
import {SharingOperator, Vehicle, VehicleType} from './model/model';
import {concatMap, forkJoin, map} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {fromLonLat} from 'ol/proj';

@Injectable( {
  providedIn: 'root',
} )
export class GeneralBikeShareFeed {

  private readonly http = inject( HttpClient );

  public loadOperatorVehicles( operator: SharingOperator ) {

    // @ts-ignore
    return this.http.get<any>( GBFS_URLS[operator] ).pipe(
      // 1️ extract feeds
      map( res => res.data.en.feeds as Feed[] ),

      // 2️ extract needed feed URLs
      map( feeds => ({
        bikesFeed: feeds.find( f => f.name === 'free_bike_status' )!,
        vehicleTypesFeed: feeds.find( f => f.name === 'vehicle_types' )!
      }) ),

      // 3 fetch both feeds in parallel
      concatMap( ( {bikesFeed, vehicleTypesFeed} ) =>
        forkJoin( {
          bikesRes: this.http.get<any>( bikesFeed.url ),
          vehicleTypesRes: this.http.get<any>( vehicleTypesFeed.url )
        } )
      ),

      // 4 join bikes with vehicle types
      map( ( {bikesRes, vehicleTypesRes} ) => {
        const bikes = bikesRes.data.bikes as VehicleFromFeed[];
        const vehicleTypes = vehicleTypesRes.data.vehicle_types as VehicleTypeFromFeed[];

        // Build lookup map for O(1) joins
        const vehicleTypeMap = new Map(
          vehicleTypes.map( vt => [vt.vehicle_type_id, vt] )
        );

        return bikes.map<VehicleWithType>( bike => ({
          ...bike,
          form_factor: vehicleTypeMap.get( bike.vehicle_type_id )?.form_factor
        }) ).map( v => ({
          id: v.bike_id,
          operator: operator,
          vehicleType: v.form_factor as VehicleType,
          coordinates: fromLonLat( [v.lon, v.lat] ),
          percentageCharge: +(100 * v.current_fuel_percent).toFixed( 0 ),
          estimatedDistance: +((v.current_range_meters ?? 0) / 1000).toFixed( 1 ),
          rentalUri: v.rental_uris?.android
        } as Vehicle) );
      } )
    );
  }
}

const GBFS_URLS: Record<SharingOperator, string> = {
  dott: 'https://gbfs.api.ridedott.com/public/v2/rome/gbfs.json',
  bird: 'https://mds.bird.co/gbfs/v2/public/rome/gbfs.json',
  lime: 'https://data.lime.bike/api/partners/v2/gbfs/rome/gbfs.json'
};

interface Feed {
  name: string;
  url: string;
}

interface VehicleFromFeed {
  bike_id: string;
  lat: number;
  lon: number;
  vehicle_type_id: string;
  current_range_meters?: number;
  current_fuel_percent: number;
  is_reserved: boolean;
  is_disabled: boolean;
  rental_uris?: Record<'android' | 'ios', string>;
}

interface VehicleTypeFromFeed {
  vehicle_type_id: string;
  form_factor: 'scooter' | 'bicycle' | string;
  propulsion_type: string;
  max_range_meters: number;
}

interface VehicleWithType extends VehicleFromFeed {
  form_factor?: VehicleTypeFromFeed['form_factor'];
}
