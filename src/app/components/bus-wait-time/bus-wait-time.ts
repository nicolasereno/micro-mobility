import {Component, computed, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {BusTimesInfo} from '../../model/model';
import {busWaitTimes, preferredStops, stopCode, stopName} from '../../reducers';
import {MatList, MatListItem} from '@angular/material/list';
import {BusesActions} from '../../actions/buses.actions';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-bus-wait-time',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatList, MatListItem, MatIcon, MatIconButton],
  templateUrl: './bus-wait-time.html',
  styleUrl: './bus-wait-time.scss',
  standalone: true
})
export class BusWaitTime {

  private readonly store = inject(Store);

  protected readonly busWaitTimes = this.store.selectSignal<BusTimesInfo[] | undefined>(busWaitTimes)
  protected readonly stopCode = this.store.selectSignal<string | undefined>(stopCode)
  protected readonly stopName = this.store.selectSignal<string | undefined>(stopName)
  protected readonly preferredStops = this.store.selectSignal<string[]>(preferredStops)
  protected readonly isPreferred = computed(() => this.stopCode() !== undefined && this.preferredStops().includes(this.stopCode()!));

  protected reloadData() {
    this.store.dispatch(BusesActions.refreshBuses({stopCode: this.stopCode()!}))
  }

  protected togglePreferred(stopCode: string | undefined) {
    if (this.isPreferred()) {
      this.store.dispatch(BusesActions.removePreferredStop({stopCode: stopCode!}));
    } else {
      this.store.dispatch(BusesActions.addPreferredStop({stopCode: stopCode!}));
    }
  }
}
