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
      'Accept': 'application/json-rpc',
      'Content-Type': 'application/json-rpc'
    } );
    const body = {
      jsonrpc: '2.0',
      id: 'ID7',
      method: 'paline_previsioni',
      params: [stopId, 'it']
    };

    return this.http
      .post<any>( 'https://corsproxy.io/?url=' + encodeURIComponent( 'https://romamobile.it/json/' ), body, {headers} )
      .pipe(
        retry( 3 ),
        map( res => {
          const result = res.result;

          return {
            stopCode: stopId,
            stopName: result.nome as string,
            arrivals: result.arrivi.map( ( a: any ) => ({
              lineCode: a.linea as string,
              vehicleNumber: a.id_veicolo as number,
              direction: a.destinazione as string,
              atStart: a.a_capolinea === 1,
              distance: a.distanza_fermate as number,
              time: a.tempo_attesa as number,
              arriving: a.in_arrivo === 1
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
}
