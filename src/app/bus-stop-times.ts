import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, Observable, retry} from 'rxjs';
import {BusStopTimesInfo, BusTimesInfo} from './model/model';

@Injectable( {
  providedIn: 'root',
} )
export class BusStopTimes {

  private readonly http = inject( HttpClient );

  public loadBusStopTimes( stopId: string ): Observable<BusStopTimesInfo> {
    const headers = new HttpHeaders( {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    } );

    return this.http
      .get<any>( 'https://corsproxy.io/?url=' + encodeURIComponent( 'https://viaggiacon.atac.roma.it/proxy/proxy.ashx?url=url.tpPortalStopInfo/stopCode%3D' + stopId + '&dongle=' + Math.random() ), {headers} )
      .pipe(
        retry( 3 ),
        map( res => {
          const result = res.stopsinfo[0];

          return {
            stopCode: stopId,
            stopName: result.name as string,
            arrivals: result.realtimeinfo.map( ( a: any ) => ({
              lineCode: a.line as string,
              direction: a.linedest as string,
              atStart: a.ultfermata === 1,
              distance: this.parseDistance( a.distanzaAVM ),
              time: this.parseTime( a.distanzaAVM ),
              arriving: a.distanzaAVM === 'IN ARRIVO'
            }) ).sort( ( a: BusTimesInfo, b: BusTimesInfo ) => {
              // 1️⃣ arriving: true first
              if ( a.arriving !== b.arriving ) {
                return a.arriving ? -1 : 1;
              }
              // 2️⃣ atStart: false first
              if ( a.atStart !== b.atStart ) {
                return a.atStart ? 1 : -1;
              }
              // 3️⃣ distance: numeric ascending
              const distanceDiff = Number( a.distance ) - Number( b.distance );
              if ( distanceDiff !== 0 ) {
                return distanceDiff;
              }
              // 4️⃣ lineCode: string ascending
              return a.lineCode.localeCompare( b.lineCode );
            } )
          };
        } )
      );
  }

  private parseDistance( fmt: string ) {
    if ( fmt === 'IN ARRIVO' ) {
      return undefined;
    }
    const match = fmt.match( /^(\d+)/ );
    return match ? Number( match[1] ) : undefined;
  }

  private parseTime( fmt: any ) {
    if ( fmt === 'IN ARRIVO' ) {
      return undefined;
    }
    const match = fmt.match( /\((\d+)'?\)/ );
    return match ? Number( match[1] ) : undefined;
  }
}
