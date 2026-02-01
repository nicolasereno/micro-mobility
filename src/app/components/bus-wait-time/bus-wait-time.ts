import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {BusTimesInfo} from '../../model/model';
import {busWaitTimes, stopCode, stopName} from '../../reducers';
import {MatList, MatListItem} from '@angular/material/list';
import {BusesActions} from '../../actions/buses.actions';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';

@Component( {
  selector: 'app-bus-wait-time',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatList,
    MatListItem
  ],
  templateUrl: './bus-wait-time.html',
  styleUrl: './bus-wait-time.css',
} )
export class BusWaitTime {

  private readonly store = inject( Store );

  protected busWaitTimes = this.store.selectSignal<BusTimesInfo[] | undefined>( busWaitTimes )
  protected stopCode = this.store.selectSignal<string | undefined>( stopCode )
  protected stopName = this.store.selectSignal<string | undefined>( stopName )


  protected reloadData() {
    this.store.dispatch( BusesActions.refreshBuses( {stopCode: this.stopCode()!} ) )
  }
}
