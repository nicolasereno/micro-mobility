import {Component, effect, inject, OnInit} from '@angular/core';
import {Feature, MapBrowserEvent, View} from 'ol';
import {MapboxVectorLayer} from 'ol-mapbox-style';
import Map from 'ol/Map';
import {Store} from '@ngrx/store';
import {
  accuracy,
  allVehicles,
  bicycleVisible,
  mapCenter,
  mapZoom,
  minimumCharge,
  operatorsVisible,
  position,
  scooterVisible,
  stopCode
} from '../../reducers';
import {PRIMARY_COLORS, SECONDARY_COLORS, SHARING_OPERATORS, SharingOperator, Vehicle, VehicleType} from '../../model/model';
import {Fill, Icon, Stroke, Style} from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Circle, Geometry, Point} from 'ol/geom';
import {MapsActions} from '../../actions/maps.actions';
import {Coordinate} from 'ol/coordinate';
import {initialState} from '../../reducers/maps.reducer';
import CircleStyle from 'ol/style/Circle';
import {FeatureLike} from 'ol/Feature';
import {GeoJSON} from 'ol/format';
import Text from 'ol/style/Text';
import {BusesActions} from '../../actions/buses.actions';
import {VehiclesActions} from '../../actions/vehicles.actions';

@Component( {
  selector: 'app-integrated-map',
  imports: [],
  templateUrl: './integrated-map.html',
  styleUrl: './integrated-map.css',
  standalone: true
} )
export class IntegratedMap implements OnInit {

  private readonly vehiclesVectorSource = new VectorSource();
  private readonly positionVectorSource = new VectorSource();
  private readonly view: View;

  private stopsLayer: VectorLayer | null = null;
  private vehiclesLayer: VectorLayer | null = null;

  private store = inject( Store )

  private vehicles = this.store.selectSignal<Record<SharingOperator, Vehicle[]>>( allVehicles );
  private center = this.store.selectSignal<Coordinate>( mapCenter );
  private zoom = this.store.selectSignal<number>( mapZoom );
  private position = this.store.selectSignal<Coordinate | undefined>( position );
  private accuracy = this.store.selectSignal<number | undefined>( accuracy );
  private bicycleVisible = this.store.selectSignal<boolean>( bicycleVisible );
  private scooterVisible = this.store.selectSignal<boolean>( scooterVisible );
  private operatorsVisible = this.store.selectSignal<Record<SharingOperator, boolean>>( operatorsVisible );
  private minimumCharge = this.store.selectSignal<number>( minimumCharge );
  private stopCode = this.store.selectSignal<string | undefined>( stopCode );


  constructor() {
    this.view = new View( {
      zoom: initialState.zoom,
      center: initialState.position
    } );
    effect( () => {
      this.vehiclesVectorSource.clear();
      for ( const operator of SHARING_OPERATORS ) {
        this.vehiclesVectorSource
          .addFeatures( this.toFeatures( this.vehicles()[operator]
            .filter( v => this.minimumCharge() <= v.percentageCharge )
            .filter( v => this.operatorsVisible()[operator] && (v.vehicleType === 'bicycle' && this.bicycleVisible() || v.vehicleType === 'scooter' && this.scooterVisible()) ) ) );
      }
    } );

    effect( () => {
      console.log( this.stopCode() );
      this.stopsLayer!.changed();
    } );

    effect( () => {
      this.view.animate( {
        center: [this.center()[0], this.center()[1]],
        zoom: this.zoom(),
        duration: 500
      } )
    } );

    effect( () => {
      if ( this.position() === undefined ) {
        return;
      }
      if ( this.positionVectorSource.getFeatures().length === 0 ) {
        this.store.dispatch( MapsActions.zoomToPosition() );
      }
      this.positionVectorSource.clear();
      const feature = new Feature( {
        geometry: new Point(
          this.position()!
        )
      } );
      feature.setStyle( new Style( {
        image: new CircleStyle( {
          radius: 6,
          fill: new Fill( {
            color: 'rgba(255, 255, 0, 0.6)',
          } ),
          stroke: new Stroke( {
            color: '#000000',
            width: 1,
          } )
        } ),
      } ) );
      this.positionVectorSource.addFeature( feature );
      const positionAccuracy = new Feature( new Circle( this.position()!, this.accuracy() ) );
      positionAccuracy.setStyle( new Style( {
        fill: new Fill( {
          color: 'rgba(255, 255, 0, 0.3)',
        } ),
        stroke: new Stroke( {
          color: 'rgba(0, 0, 0, 0.6)',
          width: 0.5,
        } )
      } ) )
      this.positionVectorSource.addFeature( positionAccuracy );
    } )
  }

  private toFeatures( vv: Vehicle[] ): Feature<Geometry>[] {
    return vv.map( v => {
      const feature = new Feature( {
        geometry: new Point(
          v.coordinates
        ),
        vehicleId: v.id,
        operator: v.operator,
        vehicleType: v.vehicleType,
        percentageCharge: v.percentageCharge
      } );
      feature.setStyle( ( feat: FeatureLike, res: number ) => {
        if ( res < 4 ) {
          return this.styleForElement( feat.getProperties()['operator'] as SharingOperator, feat.getProperties()['vehicleType'] as VehicleType, feat.getProperties()['percentageCharge'] as number )
        }
        return new Style( {
          image: new CircleStyle( {
            radius: 6,
            fill: new Fill( {
              color: PRIMARY_COLORS[feat.getProperties()['operator'] as SharingOperator],
            } ),
            stroke: new Stroke( {
              color: SECONDARY_COLORS[feat.getProperties()['operator'] as SharingOperator],
              width: 1,
            } )
          } ),
        } )
      } );
      return feature;
    } )
  }


  ngOnInit(): void {
    const map = new Map( {
      target: 'map',
      view: this.view,
      controls: [],
    } );
    const openstreetmap = new MapboxVectorLayer( {
      styleUrl: 'openstreetmap.json',
    } );
    this.vehiclesLayer = new VectorLayer( {
      source: this.vehiclesVectorSource,
      minZoom: 13,
      maxZoom: 24,
    } );
    this.stopsLayer = new VectorLayer( {
      source: new VectorSource( {
        url: 'stops.json',
        format: new GeoJSON(),
      } ),
      minZoom: 16,
      maxZoom: 24,
    } );
    const busStopStyle = (
      feature: FeatureLike,
      ignored: number
    ): Style => {
      const code = feature.get( 'c' ) ?? '';
      const isSelectedCode = this.stopCode() === code;
      const secondary = '#fff';
      const primary = '#000';
      const margin = 2;

      return new Style( {
        text: new Text( {
          text: String( code ),
          font: 'bold 12px Arial',
          padding: [margin, 0, 0, margin],
          textAlign: 'center',
          textBaseline: 'middle',
          fill: isSelectedCode ? new Fill( {color: secondary} ) : new Fill( {color: primary} ),
          backgroundFill: isSelectedCode ? new Fill( {color: primary} ) : new Fill( {color: secondary} ),
          backgroundStroke: new Stroke( {
            color: isSelectedCode ? secondary : primary,
            width: margin
          } )
        } )
      } );
    };
    this.stopsLayer.setStyle( busStopStyle );
    map.on( 'singleclick', ( event: MapBrowserEvent ) => {
      const stopFeature = map.forEachFeatureAtPixel(
        event.pixel,
        ( f: FeatureLike ) => f,
        {
          layerFilter: ( layer ) => layer === this.stopsLayer
        }
      );
      if ( stopFeature ) {
        const code = stopFeature.get( 'c' );
        this.store.dispatch( BusesActions.loadBuses( {stopCode: code} ) );
      }

      const vehicleFeature = map.forEachFeatureAtPixel(
        event.pixel,
        ( f: FeatureLike ) => f,
        {
          layerFilter: ( layer ) => layer === this.vehiclesLayer
        }
      );
      if ( vehicleFeature ) {
        const operator = vehicleFeature.get( 'operator' ) as SharingOperator;
        const id = vehicleFeature.get( 'vehicleId' ) as string;
        this.store.dispatch( VehiclesActions.selectVehicle( {operator, id} ) );
      }
    } );
    map.addLayer( openstreetmap );
    map.addLayer( this.stopsLayer );
    map.addLayer( this.vehiclesLayer );
    map.addLayer( new VectorLayer( {
      source: this.positionVectorSource,
    } ) );
    this.store.dispatch( MapsActions.zoomToPosition() );
  }

  private styleForElement( operator: SharingOperator, vehicleType: VehicleType, chargePercentage: number ) {

    return [
      this.createSvgProgressStyle( chargePercentage, PRIMARY_COLORS[operator] ),
      new Style( {
        image: new Icon( {
          src: `/icons/${vehicleType}.svg`,
          scale: 0.9,
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          color: SECONDARY_COLORS[operator]
        } ),
      } )];
  }

  private createSvgProgressStyle( percentage: number, fillColor: string ): Style {
    const svg = this.generateProgressSvg( percentage, {
      progressColor:
        percentage < 20 ? '#f44336' :
          percentage < 50 ? '#ffc107' :
            '#4caf50',
      fillColor
    } );

    return new Style( {
      image: new Icon( {
        src: this.svgToDataUrl( svg ),
        scale: 1,
        anchor: [0.5, 0.5],
      } ),
    } );
  }

  private generateProgressSvg(
    percentage: number,
    options?: {
      size?: number;
      strokeWidth?: number;
      progressColor?: string;
      backgroundColor?: string;
      fillColor?: string,
    }
  ): string {
    const size = options?.size ?? 32;
    const strokeWidth = options?.strokeWidth ?? 3;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;

    const progressColor = options?.progressColor ?? '#4caf50';
    const backgroundColor = options?.backgroundColor ?? '#ffffff';
    const fillColor = options?.fillColor ?? '#ffffff';

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background circle -->
  <circle
    cx="${center}"
    cy="${center}"
    r="${radius}"
    stroke="${backgroundColor}"
    stroke-width="${strokeWidth}"
    fill="${fillColor}"
  />

  <!-- Progress ring -->
  <circle
    cx="${center}"
    cy="${center}"
    r="${radius}"
    stroke="${progressColor}"
    stroke-width="${strokeWidth}"
    fill="${fillColor}"
    stroke-dasharray="${progress} ${circumference}"
    stroke-linecap="round"
    transform="rotate(-90 ${center} ${center})"
  />
</svg>`;
  }

  private svgToDataUrl( svg: string ): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent( svg )}`;
  }
}
