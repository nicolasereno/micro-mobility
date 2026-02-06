import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {OPERATORS_OPEN_LINK, Vehicle} from '../../model/model';
import {selectedVehicle} from '../../reducers';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component( {
  selector: 'app-vehicle-detail',
  imports: [MatCard, MatButton, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatIcon],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
  standalone: true
} )
export class VehicleDetail {

  private readonly store = inject( Store );

  protected selectedVehicle = this.store.selectSignal<Vehicle | undefined>( selectedVehicle )

  protected openApp( vehicle: Vehicle ) {
    if ( vehicle.rentalUri ) {
      window.open( vehicle.rentalUri, '_blank' );
    } else {
      window.open( OPERATORS_OPEN_LINK( vehicle )[vehicle.operator], '_blank' );
    }
  }
}
