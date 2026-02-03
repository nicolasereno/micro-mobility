import {Component, effect, inject, OnInit} from '@angular/core';
import {IntegratedMap} from './components/map/integrated-map';
import {Store} from '@ngrx/store';
import {MapsActions} from './actions/maps.actions';
import {bicycleVisible, busWaitTimes, minimumCharge, scooterVisible, selectedVehicle} from './reducers';
import {BusTimesInfo, SHARING_OPERATORS, SharingOperator, Vehicle} from './model/model';
import {VehiclesActions} from './actions/vehicles.actions';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatFabButton} from '@angular/material/button';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {filter, fromEvent, interval, map} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {BusWaitTime} from './components/bus-wait-time/bus-wait-time';
import {BottomSheetState} from './services/bottom-sheet-state';
import {BusesActions} from './actions/buses.actions';
import {VehicleDetail} from './components/vehicle-detail/vehicle-detail';
import {MatIcon} from '@angular/material/icon';

@Component( {
  selector: 'app-root',
  imports: [IntegratedMap, MatIcon, MatButtonToggleGroup, MatButtonToggle, MatSlider, MatSliderThumb, MatFabButton],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
} )
export class App implements OnInit {

  private readonly store = inject( Store );
  private readonly bottomSheetState = inject( BottomSheetState );

  protected bicycleVisible = this.store.selectSignal<boolean>( bicycleVisible );
  protected scooterVisible = this.store.selectSignal<boolean>( scooterVisible );
  protected minimumCharge = this.store.selectSignal<number>( minimumCharge );

  protected busWaitTimes = this.store.selectSignal<BusTimesInfo[] | undefined>( busWaitTimes )
  protected selectedVehicle = this.store.selectSignal<Vehicle | undefined>( selectedVehicle )

  protected readonly SHARING_OPERATORS = SHARING_OPERATORS;

  private readonly visibility = toSignal(
    fromEvent( document, 'visibilitychange' )
      .pipe(
        map( () => document.visibilityState === 'visible' ) ),
    {initialValue: true}
  );

  constructor() {
    effect( () => {
      console.log( 'OPEN: ' + this.bottomSheetState.isOpen() );
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
    interval( 5000 )
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

  protected toggleScooter() {
    this.store.dispatch( MapsActions.toggleScooter() );
  }

  protected toggleBicycle() {
    this.store.dispatch( MapsActions.toggleBicycle() )
  }

  protected toggleOperator( operator: SharingOperator ) {
    this.store.dispatch( VehiclesActions.toggleOperator( {operator} ) )
  }

  filterMinimumCharge( minimumCharge: number ) {
    this.store.dispatch( MapsActions.minimumCharge( {minimumCharge} ) );
  }
}
