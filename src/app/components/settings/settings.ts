import {Component, computed, inject} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {Store} from '@ngrx/store';
import {followGps, minimumCharge, minimumDistance, theme} from '../../reducers';
import {SettingsActions} from '../../actions/settings.actions';
import {ThemeService} from '../../services/theme-service';

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
  private readonly themeService = inject( ThemeService );

  protected readonly minimumCharge = this.store.selectSignal<number>( minimumCharge );
  protected readonly minimumDistance = this.store.selectSignal<number>( minimumDistance );
  protected readonly followGps = this.store.selectSignal<boolean>( followGps );
  protected readonly theme = this.store.selectSignal<'light' | 'dark'>( theme );
  protected readonly isLight = computed( () => this.theme() === 'light' );

  filterMinimumCharge( minimumCharge: number ) {
    this.store.dispatch( SettingsActions.minimumCharge( {minimumCharge} ) );
  }

  protected filterMinimumDistance( minimumDistance: number ) {
    this.store.dispatch( SettingsActions.minimumDistance( {minimumDistance} ) );
  }

  protected toggleFollowGps() {
    if ( this.followGps() ) {
      this.store.dispatch( SettingsActions.unfollowGPS() );
    } else {
      this.store.dispatch( SettingsActions.followGPS() );
    }
  }

  protected toggleTheme() {
    if ( this.isLight() ) {
      this.store.dispatch( SettingsActions.changeTheme( {theme: 'dark'} ) );
    } else {
      this.store.dispatch( SettingsActions.changeTheme( {theme: 'light'} ) );
    }
  }
}
