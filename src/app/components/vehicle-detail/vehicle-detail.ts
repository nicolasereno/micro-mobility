import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {SharingOperator, Vehicle} from '../../model/model';
import {selectedVehicle} from '../../reducers';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatButton} from '@angular/material/button';

@Component({
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
})
export class VehicleDetail {

  private readonly store = inject(Store);

  protected selectedVehicle = this.store.selectSignal<Vehicle | undefined>(selectedVehicle)

  protected openApp(vehicle: Vehicle) {
    if (vehicle.rentalUri) {
      window.open(vehicle.rentalUri, '_blank');
    } else {
      const operatorsLink: Record<SharingOperator, string> = {
        bird: `https://play.google.com/store/apps/details?id=co.bird.android`,
        lime: `limebike://map?selected_vehicle_id=${vehicle.id}`,
        dott: `https://go.ridedott.com/vehicles/${vehicle.id}?platform=android`
      };
      window.open(operatorsLink[vehicle.operator], '_blank');
    }
  }
}
