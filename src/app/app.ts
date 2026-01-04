import {Component, inject, OnInit} from '@angular/core';
import {IntegratedMap} from './map/integrated-map';
import {Store} from '@ngrx/store';
import {MapsActions} from './actions/maps.actions';
import {bicycleVisible, operatorVisible, scooterVisible} from './reducers';
import {SharingOperator} from './model/model';
import {VehiclesActions} from './actions/vehicles.actions';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [IntegratedMap, MatButtonToggleGroup, MatButtonToggle, MatButton],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private store = inject(Store);
  protected bicycleVisible = this.store.selectSignal<boolean>(bicycleVisible);
  protected scooterVisible = this.store.selectSignal<boolean>(scooterVisible);
  protected limeVisible = this.store.selectSignal<boolean>(operatorVisible('lime'));
  protected dottVisible = this.store.selectSignal<boolean>(operatorVisible('dott'));
  protected birdVisible = this.store.selectSignal<boolean>(operatorVisible('bird'));

  ngOnInit() {
    this.reloadData();
  }

  protected reloadData() {
    this.store.dispatch(VehiclesActions.loadVehicles({operator: 'dott'}));
    this.store.dispatch(VehiclesActions.loadVehicles({operator: 'lime'}));
    this.store.dispatch(VehiclesActions.loadVehicles({operator: 'bird'}));
  }

  protected zoomToPosition() {
    this.store.dispatch(MapsActions.zoomToPosition());
  }

  protected toggleScooter() {
    this.store.dispatch(MapsActions.toggleScooter());
  }

  protected toggleBicycle() {
    this.store.dispatch(MapsActions.toggleBicycle())
  }

  protected toggleOperator(operator: SharingOperator) {
    this.store.dispatch(VehiclesActions.toggleOperator({operator}))
  }
}
