import {Component, effect, inject, OnInit} from '@angular/core';
import {IntegratedMap} from './components/map/integrated-map';
import {Store} from '@ngrx/store';
import {MapsActions} from './actions/maps.actions';
import {
  busWaitTimes, nearStops,
  operatorsError,
  operatorsVisible, position,
  positionAvailable,
  preferredStops,
  selectedVehicle,
  theme,
  vehicleTypesVisible
} from './reducers';
import {BusStop, BusTimesInfo, NearBusStop, SHARING_OPERATORS, SharingOperator, Vehicle, VEHICLE_TYPES, VehicleType} from './model/model';
import {VehiclesActions} from './actions/vehicles.actions';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatMiniFabButton} from '@angular/material/button';
import {filter, fromEvent, interval, map} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {BusWaitTime} from './components/bus-wait-time/bus-wait-time';
import {BottomSheetState} from './services/bottom-sheet-state';
import {BusesActions} from './actions/buses.actions';
import {VehicleDetail} from './components/vehicle-detail/vehicle-detail';
import {MatIcon} from '@angular/material/icon';
import {MatBadge} from '@angular/material/badge';
import {Settings} from './components/settings/settings';
import {ThemeService} from './services/theme-service';
import {PreferredStops} from './components/preferred-stops/preferred-stops';
import {Coordinate} from 'ol/coordinate';
import {toLonLat} from 'ol/proj';
import {NearStops} from './components/near-stops/near-stops';

@Component( {
  selector: 'app-root',
  imports: [IntegratedMap, MatIcon, MatButtonToggleGroup, MatButtonToggle, MatMiniFabButton, MatBadge],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
} )
export class App implements OnInit {

  protected readonly VEHICLE_TYPES = VEHICLE_TYPES;
  protected readonly SHARING_OPERATORS = SHARING_OPERATORS;

  private readonly store = inject( Store );
  private readonly bottomSheetState = inject( BottomSheetState );
  private readonly themeService = inject( ThemeService );

  protected readonly positionAvailable = this.store.selectSignal<boolean>( positionAvailable );
  protected readonly position = this.store.selectSignal<Coordinate | undefined>( position );
  protected readonly busWaitTimes = this.store.selectSignal<BusTimesInfo[] | undefined>( busWaitTimes )
  protected readonly selectedVehicle = this.store.selectSignal<Vehicle | undefined>( selectedVehicle )
  protected readonly operatorsError = this.store.selectSignal<Record<SharingOperator, boolean>>( operatorsError );
  protected readonly vehicleTypesVisible = this.store.selectSignal<Record<VehicleType, boolean>>( vehicleTypesVisible );
  protected readonly operatorsVisible = this.store.selectSignal<Record<SharingOperator, boolean>>( operatorsVisible );
  protected readonly preferredStops = this.store.selectSignal<BusStop[]>( preferredStops );
  protected readonly nearBusStops = this.store.selectSignal<NearBusStop[] | undefined>( nearStops );
  private readonly theme = this.store.selectSignal<'light' | 'dark'>( theme );

  private readonly visibility = toSignal(
    fromEvent( document, 'visibilitychange' )
      .pipe(
        map( () => document.visibilityState === 'visible' ) ),
    {initialValue: true}
  );

  constructor() {
    effect( () => {
      this.themeService.setTheme( this.theme() );
    } );
    effect( () => {
      if ( !this.bottomSheetState.isOpen() ) {
        this.store.dispatch( BusesActions.clearBuses() );
        this.store.dispatch( VehiclesActions.unselectVehicle() );
      }
    } );
    effect( () => {
      if ( this.busWaitTimes() && !this.bottomSheetState.isOpen() ) {
        this.bottomSheetState.open( BusWaitTime );
      }
    } );
    effect( () => {
      if ( this.selectedVehicle() && !this.bottomSheetState.isOpen() ) {
        this.bottomSheetState.open( VehicleDetail );
      }
    } );
    effect( () => {
      if ( this.nearBusStops() !== undefined ) {
        this.bottomSheetState.open( NearStops );
      }
    } );
    interval( 2.5 * 1000 )
      .pipe(
        takeUntilDestroyed(),
        filter( () => this.visibility() ) )
      .subscribe( () => this.getGPSPosition() );
    interval( 2 * 60 * 1000 )
      .pipe(
        takeUntilDestroyed(),
        filter( () => this.visibility() ) )
      .subscribe( () => this.reloadData() );
  }

  ngOnInit() {
    this.getGPSPosition();
    this.reloadData();
  }

  protected openSettings() {
    this.bottomSheetState.open( Settings );
  }

  private getGPSPosition() {
    this.store.dispatch( MapsActions.getGPSPosition() );
  }

  protected reloadData() {
    for ( const operator of SHARING_OPERATORS ) {
      this.store.dispatch( VehiclesActions.loadVehicles( {operator} ) );
    }
  }

  protected zoomToPosition() {
    this.store.dispatch( MapsActions.zoomToPosition() );
  }

  protected toggleVehicleType( vehicleType: VehicleType ) {
    this.store.dispatch( MapsActions.toggleVehicleType( {vehicleType} ) );
  }

  protected toggleOperator( operator: SharingOperator ) {
    this.store.dispatch( VehiclesActions.toggleOperator( {operator} ) )
  }

  protected openPreferredStops() {
    this.bottomSheetState.open( PreferredStops );
  }

  protected searchNearStops() {
    const lonLat = toLonLat(this.position()!);
    this.store.dispatch( BusesActions.loadNearBusStops({lon: lonLat[0], lat: lonLat[1]}) );
  }
}
