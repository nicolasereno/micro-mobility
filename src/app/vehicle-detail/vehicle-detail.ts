import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Vehicle} from '../model/model';
import {selectedVehicle} from '../reducers';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatButton} from '@angular/material/button';

@Component( {
  selector: 'app-vehicle-detail',
  imports: [
    MatCard,
    MatButton,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions
  ],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
} )
export class VehicleDetail {

  private readonly store = inject( Store );

  protected selectedVehicle = this.store.selectSignal<Vehicle | undefined>( selectedVehicle )
}
