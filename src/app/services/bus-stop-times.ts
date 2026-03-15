import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, retry} from 'rxjs';
import {BusStopTimesInfo, BusTimesInfo} from '../model/model';

@Injectable({
  providedIn: 'root',
})
export class BusStopTimes {

  private readonly http = inject(HttpClient);

  public loadBusStopTimes(stopId: string, description: string): Observable<BusStopTimesInfo> {
    return this.http
      .get<BusTimesInfo[]>(`https://gtfs-rome.homelinuxserver.org/api/wait-times/${stopId}`)
      .pipe(
        retry(3),
        map(result => ({
          stopCode: stopId,
          stopName: description,
          arrivals: result,
        }))
      );
  }
}
