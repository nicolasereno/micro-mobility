import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {BottomSheetState} from '../../services/bottom-sheet-state';
import {BusStop, NearBusStop} from '../../model/model';
import {BusesActions} from '../../actions/buses.actions';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {nearStops} from '../../reducers';

@Component( {
  selector: 'app-near-stops',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './near-stops.html',
  styleUrl: './near-stops.scss',
} )
export class NearStops implements OnDestroy {

  private readonly store = inject( Store );
  private readonly bottomSheetState = inject( BottomSheetState );

  protected readonly nearStops = this.store.selectSignal<NearBusStop[] | undefined>( nearStops )

  openStop( busStop: BusStop ) {
    this.bottomSheetState.close();
    this.store.dispatch( BusesActions.loadBuses( {stop: busStop} ) );
  }

  ngOnDestroy() {
    this.store.dispatch( BusesActions.clearNearBusStops() );
  }
}
