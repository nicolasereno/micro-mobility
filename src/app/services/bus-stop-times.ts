import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, retry} from 'rxjs';
import {BusStopTimesInfo, BusTimesInfo, NearBusStop} from '../model/model';
import {toFixed} from 'ol/math';

@Injectable( {
  providedIn: 'root',
} )
export class BusStopTimes {

  private readonly http = inject( HttpClient );

  public loadBusStopTimes( stopId: string, description: string ): Observable<BusStopTimesInfo> {
    return this.http
      .get<BusTimesInfo[]>( `https://gtfs-rome.homelinuxserver.org/api/wait-times/${stopId}` )
      .pipe(
        retry( 3 ),
        map( result => ({
          stop: {stopId: stopId, description: description},
          arrivals: result,
        }) )
      );
  }

  public searchNearestStops( lon: number, lat: number ): Observable<NearBusStop[]> {
    return this.http
      .get<{
        id: string;
        name: string;
        distanceMeters: number
      }[]>( `https://gtfs-rome.homelinuxserver.org/api/gis/nearest-stops?lat=${lat}&lon=${lon}` )
      .pipe(
        retry( 3 ),
        map( result => result.map( stop =>
          ({stop: {stopId: stop.id, description: stop.name}, distance: toFixed( stop.distanceMeters, 0 )})
        ) ) )
  }

}
