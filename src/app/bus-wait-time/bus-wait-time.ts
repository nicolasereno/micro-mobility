import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {BusTimesInfo} from '../model/model';
import {busWaitTimes, stopCode, stopName} from '../reducers';
import {MatDivider, MatList, MatListItem} from '@angular/material/list';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {BusesActions} from '../actions/buses.actions';
import {MatCard} from '@angular/material/card';

@Component( {
  selector: 'app-bus-wait-time',
  imports: [
    MatList,
    MatListItem,
    MatButton,
    MatIcon,
    MatDivider,
    MatCard
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
