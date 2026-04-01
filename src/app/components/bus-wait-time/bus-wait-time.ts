import {Component, computed, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {BusStop, BusTimesInfo} from '../../model/model';
import {busWaitTimes, preferredStops, stop} from '../../reducers';
import {BusesActions} from '../../actions/buses.actions';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component( {
  selector: 'app-bus-wait-time',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatIcon, MatIconButton],
  templateUrl: './bus-wait-time.html',
  styleUrl: './bus-wait-time.scss',
  standalone: true
} )
export class BusWaitTime {

  private readonly store = inject( Store );

  protected readonly busWaitTimes = this.store.selectSignal<BusTimesInfo[] | undefined>( busWaitTimes )
  protected readonly stop = this.store.selectSignal<BusStop | undefined>( stop )
  protected readonly preferredStops = this.store.selectSignal<BusStop[]>( preferredStops )
  protected readonly isPreferred = computed( () => this.stop() !== undefined && this.preferredStops().find( stop => stop.stopId === this.stop()?.stopId! ) !== undefined );

  protected reloadData() {
    this.store.dispatch( BusesActions.refreshBuses( {stop: this.stop()!} ) )
  }

  protected togglePreferred( stop: BusStop | undefined ) {
    if ( this.isPreferred() ) {
      this.store.dispatch( BusesActions.removePreferredStop( {stopId: stop!.stopId} ) );
    } else {
      this.store.dispatch( BusesActions.addPreferredStop( {stop: stop!} ) );
    }
  }
}
