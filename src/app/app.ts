import {Component, effect, inject, OnInit} from '@angular/core';
import {IntegratedMap} from './map/integrated-map';
import {Store} from '@ngrx/store';
import {MapsActions} from './actions/maps.actions';
import {bicycleVisible, minimumCharge, operatorVisible, scooterVisible} from './reducers';
import {SharingOperator} from './model/model';
import {VehiclesActions} from './actions/vehicles.actions';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatButton} from '@angular/material/button';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {filter, fromEvent, interval, map} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';

@Component( {
  selector: 'app-root',
  imports: [IntegratedMap, MatButtonToggleGroup, MatButtonToggle, MatButton, MatSlider, MatSliderThumb],
  templateUrl: './app.html',
  styleUrl: './app.css'
} )
export class App implements OnInit {

  private store = inject( Store );
  protected bicycleVisible = this.store.selectSignal<boolean>( bicycleVisible );
  protected scooterVisible = this.store.selectSignal<boolean>( scooterVisible );
  protected limeVisible = this.store.selectSignal<boolean>( operatorVisible( 'lime' ) );
  protected dottVisible = this.store.selectSignal<boolean>( operatorVisible( 'dott' ) );
  protected birdVisible = this.store.selectSignal<boolean>( operatorVisible( 'bird' ) );
  protected minimumCharge = this.store.selectSignal<number>( minimumCharge );

  private visibility = toSignal(
    fromEvent( document, 'visibilitychange' )
      .pipe(
        map( e => document.visibilityState === 'visible' ) ),
    {initialValue: true}
  );

  constructor() {
    effect( () => {
      console.log( 'visibility changed...' + this.visibility() );
    } );
    interval( 5000 )
      .pipe(
        takeUntilDestroyed(),
        filter( _ => this.visibility() ) )
      .subscribe( () => this.getGPSPosition() );
    interval( 2 * 60 * 1000 )
      .pipe(
        takeUntilDestroyed(),
        filter( _ => this.visibility() ) )
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
