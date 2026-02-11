import {Component, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MapsActions} from '../../actions/maps.actions';
import {Store} from '@ngrx/store';
import {followGps, minimumCharge} from '../../reducers';

@Component( {
  selector: 'app-settings',
  imports: [
    MatCard,
    MatCardHeader,
    MatIcon,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatSlider,
    MatSlideToggle,
    MatSliderThumb
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  standalone: true
} )
export class Settings {

  private readonly store = inject( Store );

  protected readonly minimumCharge = this.store.selectSignal<number>( minimumCharge );
  protected readonly followGps = this.store.selectSignal<boolean>( followGps );

  filterMinimumCharge( minimumCharge: number ) {
    this.store.dispatch( MapsActions.minimumCharge( {minimumCharge} ) );
  }


  protected toggleFollowGps() {
    if ( this.followGps() ) {
      this.store.dispatch( MapsActions.unfollowGPS() );
    } else {
      this.store.dispatch( MapsActions.followGPS() );
    }
  }
}
