import {Injectable, signal} from '@angular/core';
import {Observable} from 'rxjs';

/** Samples older than this are treated as unavailable. */
const MAX_AGE = 2 * 1000;

const POSITION_OPTIONS: PositionOptions = {
  timeout: 5 * 1000,
  maximumAge: 30 * 1000,
};

type CompassOrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

type PermissionAwareDeviceOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
};

@Injectable( {providedIn: 'root'} )
export class DevicePositioningService {

  /** Whether the device has delivered at least one heading. */
  private readonly available = signal( false );
  readonly orientationAvailable = this.available.asReadonly();

  private heading: number | undefined = undefined;
  private timestamp = 0;

  constructor() {
    this.listen();
  }

  getHeading(): number | undefined {
    if ( this.heading === undefined || (new Date().getTime() - this.timestamp) > MAX_AGE ) {
      return undefined;
    }
    return this.heading;
  }

  getPosition(): Observable<GeolocationPosition> {
    return new Observable<GeolocationPosition>( observer => {
      navigator.geolocation.getCurrentPosition(
        position => {
          observer.next( position );
          observer.complete();
        },
        error => observer.error( error ),
        POSITION_OPTIONS
      );
    } );
  }

  private listen() {
    if ( !('DeviceOrientationEvent' in window) ) {
      return;
    }
    const requestPermission = (DeviceOrientationEvent as PermissionAwareDeviceOrientationEvent).requestPermission;
    if ( requestPermission ) {
      // iOS only delivers orientation events after a user initiated grant.
      window.addEventListener( 'click', () =>
          requestPermission.call( DeviceOrientationEvent )
            .then( state => state === 'granted' ? this.subscribe() : undefined )
            .catch( () => undefined ),
        {once: true} );
    } else {
      this.subscribe();
    }
  }

  private subscribe() {
    window.addEventListener( 'deviceorientationabsolute', event => this.update( event as DeviceOrientationEvent ) );
    window.addEventListener( 'deviceorientation', event => this.update( event ) );
  }

  private update( event: DeviceOrientationEvent ) {
    const heading = this.toHeading( event );
    if ( heading === null ) {
      return;
    }
    this.heading = heading;
    this.timestamp = new Date().getTime();
    this.available.set( true );
  }

  private toHeading( event: DeviceOrientationEvent ): number | null {
    const compassHeading = (event as CompassOrientationEvent).webkitCompassHeading;
    if ( compassHeading !== undefined && compassHeading !== null ) {
      return this.normalize( compassHeading + this.screenAngle() );
    }
    // alpha grows counterclockwise from north, and is only north referenced when absolute.
    if ( event.absolute && event.alpha !== null ) {
      return this.normalize( 360 - event.alpha + this.screenAngle() );
    }
    return null;
  }

  private screenAngle(): number {
    return screen.orientation?.angle ?? 0;
  }

  private normalize( heading: number ): number {
    return Math.round( (heading % 360 + 360) % 360 );
  }
}
