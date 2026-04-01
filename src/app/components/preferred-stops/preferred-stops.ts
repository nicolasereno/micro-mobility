import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {preferredStops} from '../../reducers';
import {BusStop} from '../../model/model';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {BusesActions} from '../../actions/buses.actions';
import {BottomSheetState} from '../../services/bottom-sheet-state';
import {MatIconButton} from '@angular/material/button';

@Component( {
  selector: 'app-preferred-stops',
  imports: [
    MatCard,
    MatCardHeader,
    MatIcon,
    MatIconButton,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
  ],
  templateUrl: './preferred-stops.html',
  styleUrl: './preferred-stops.scss',
  standalone: true
} )
export class PreferredStops {

  private readonly store = inject( Store );
  private readonly bottomSheetState = inject( BottomSheetState );

  protected readonly preferredStops = this.store.selectSignal<BusStop[]>( preferredStops )

  openStop( busStop: BusStop ) {
    this.bottomSheetState.close();
    this.store.dispatch( BusesActions.loadBuses( {stop: busStop} ) );
  }
}
