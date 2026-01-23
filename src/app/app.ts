import {Component, effect, inject, OnInit} from '@angular/core';
import {IntegratedMap} from './map/integrated-map';
import {Store} from '@ngrx/store';
import {MapsActions} from './actions/maps.actions';
import {bicycleVisible, busWaitTimes, minimumCharge, scooterVisible} from './reducers';
import {BusTimesInfo, SharingOperator} from './model/model';
import {VehiclesActions} from './actions/vehicles.actions';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatButton} from '@angular/material/button';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {filter, fromEvent, interval, map} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {BusWaitTime} from './bus-wait-time/bus-wait-time';
import {BottomSheetState} from './bottom-sheet-state';
import {BusesActions} from './actions/buses.actions';

@Component( {
  selector: 'app-root',
  imports: [IntegratedMap, MatButtonToggleGroup, MatButtonToggle, MatButton, MatSlider, MatSliderThumb],
  templateUrl: './app.html',
  styleUrl: './app.css'
} )
export class App implements OnInit {

  private readonly store = inject( Store );
  private readonly bottomSheetState = inject( BottomSheetState );

  protected bicycleVisible = this.store.selectSignal<boolean>( bicycleVisible );
  protected scooterVisible = this.store.selectSignal<boolean>( scooterVisible );
  protected minimumCharge = this.store.selectSignal<number>( minimumCharge );

  protected busWaitTimes = this.store.selectSignal<BusTimesInfo[] | undefined>( busWaitTimes )

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
      }
    } );
    effect( () => {
      if ( this.busWaitTimes() && !this.bottomSheetState.isOpen() ) {
        console.log( 'bus wait time arrived...' + JSON.stringify( this.busWaitTimes() ) );
        this.bottomSheetState.open( BusWaitTime );
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
    this.store.dispatch( VehiclesActions.loadVehicles( {operator: 'dott'} ) );
    this.store.dispatch( VehiclesActions.loadVehicles( {operator: 'lime'} ) );
    this.store.dispatch( VehiclesActions.loadVehicles( {operator: 'bird'} ) );
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
