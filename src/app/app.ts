import {Component, inject} from '@angular/core';
import {IntegratedMap} from './map/integrated-map';
import {Store} from '@ngrx/store';
import {MapsActions} from './actions/maps.actions';
import {bicycleVisible, operatorVisible, scooterVisible} from './reducers';
import {SharingOperator} from './model/model';
import {VehiclesActions} from './actions/vehicles.actions';

@Component({
  selector: 'app-root',
  imports: [IntegratedMap],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  private store = inject(Store);
  protected bicycleVisible = this.store.selectSignal<boolean>(bicycleVisible);
  protected scooterVisible = this.store.selectSignal<boolean>(scooterVisible);
  protected limeVisible = this.store.selectSignal<boolean>(operatorVisible('lime'));
  protected dottVisible = this.store.selectSignal<boolean>(operatorVisible('dott'));
  protected birdVisible = this.store.selectSignal<boolean>(operatorVisible('bird'));

  zoomToPosition() {
    this.store.dispatch(MapsActions.zoomToPosition());
  }

  toggleScooter() {
    this.store.dispatch(MapsActions.toggleScooter());
  }

  toggleBicycle() {
    this.store.dispatch(MapsActions.toggleBicycle())
  }

  toggleOperator(operator: SharingOperator) {
    this.store.dispatch(VehiclesActions.toggleOperator({operator}))
  }
}
