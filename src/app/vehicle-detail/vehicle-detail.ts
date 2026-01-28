import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Vehicle} from '../model/model';
import {selectedVehicle} from '../reducers';
import {MatCard} from '@angular/material/card';
import {MatDivider} from '@angular/material/list';
import {MatButton} from '@angular/material/button';

@Component( {
  selector: 'app-vehicle-detail',
  imports: [
    MatCard,
    MatDivider,
    MatButton
  ],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
} )
export class VehicleDetail {

  private readonly store = inject( Store );

  protected selectedVehicle = this.store.selectSignal<Vehicle | undefined>( selectedVehicle )
}
