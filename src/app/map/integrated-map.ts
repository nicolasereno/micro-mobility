import {Component, effect, inject, OnInit} from '@angular/core';
import {Feature, View} from 'ol';
import {MapboxVectorLayer} from 'ol-mapbox-style';
import Map from 'ol/Map';
import {Store} from '@ngrx/store';
import {VehiclesActions} from '../actions/vehicles.actions';
import {allVehicles, bicycleVisible, mapCenter, mapZoom, operatorVisible, scooterVisible} from '../reducers';
import {SharingOperator, Vehicle, VehicleType} from '../model/model';
import {Icon, Style} from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Geometry, Point} from 'ol/geom';
import {MapsActions} from '../actions/maps.actions';
import {Coordinate} from 'ol/coordinate';
import {initialState} from '../reducers/maps.reducer';


@Component({
  selector: 'app-integrated-map',
  imports: [],
  templateUrl: './integrated-map.html',
  styleUrl: './integrated-map.css',
})
export class IntegratedMap implements OnInit {

  private readonly vectorSource = new VectorSource();

  private store = inject(Store)

  private vehicles = this.store.selectSignal<Record<SharingOperator, Vehicle[]>>(allVehicles);
  private center = this.store.selectSignal<Coordinate>(mapCenter);
  private zoom = this.store.selectSignal<number>(mapZoom);
  private bicycleVisible = this.store.selectSignal<boolean>(bicycleVisible);
  private scooterVisible = this.store.selectSignal<boolean>(scooterVisible);
  private limeVisible = this.store.selectSignal<boolean>(operatorVisible('lime'));
  private dottVisible = this.store.selectSignal<boolean>(operatorVisible('dott'));
  private birdVisible = this.store.selectSignal<boolean>(operatorVisible('bird'));

  private readonly view: View;

  constructor() {
    this.view = new View({
      zoom: initialState.zoom,
      center: initialState.center
    });
    effect(() => {
      this.vectorSource.clear();
      this.vectorSource.addFeatures(this.toFeatures(this.vehicles().dott.filter(v => this.dottVisible() && (v.vehicleType === 'bicycle' && this.bicycleVisible() || v.vehicleType === 'scooter' && this.scooterVisible()))));
      this.vectorSource.addFeatures(this.toFeatures(this.vehicles().lime.filter(v => this.limeVisible() && (v.vehicleType === 'bicycle' && this.bicycleVisible() || v.vehicleType === 'scooter' && this.scooterVisible()))));
      this.vectorSource.addFeatures(this.toFeatures(this.vehicles().bird.filter(v => this.birdVisible() && (v.vehicleType === 'bicycle' && this.bicycleVisible() || v.vehicleType === 'scooter' && this.scooterVisible()))));
    });
    effect(() => {
      this.view.setZoom(this.zoom());
      this.view.setCenter([this.center()[0], this.center()[1]]);
    });
  }

  private toFeatures(vv: Vehicle[]): Feature<Geometry>[] {
    return vv.map(v => {
      let feature = new Feature({
        geometry: new Point(
          v.coordinates
        ),
        vehicleId: v.id,
        vehicleType: v.vehicleType
      });
      feature.setStyle(this.styleForElement(v.operator, v.vehicleType, v.percentageCharge));
      return feature;
    })
  }

  ngOnInit(): void {
    const map = new Map({
      target: 'map',
      view: this.view,
      controls: [],
    });
    const layer = new MapboxVectorLayer({
      styleUrl: 'openstreetmap.json',
    });
    map.addLayer(layer);
    map.addLayer(new VectorLayer({
      source: this.vectorSource,
    }))

    this.store.dispatch(MapsActions.zoomToPosition());
    this.store.dispatch(VehiclesActions.loadVehicles({operator: 'dott'}));
    this.store.dispatch(VehiclesActions.loadVehicles({operator: 'lime'}));
    this.store.dispatch(VehiclesActions.loadVehicles({operator: 'bird'}));
  }

  private styleForElement(operator: SharingOperator, vehicleType: VehicleType, chargePercentage: number) {
    const fillColors: Record<SharingOperator, string> = {
      lime: '#C0F008',
      bird: '#CED7E0',
      dott: '#00A8E9'
    };
    const borderColors: Record<SharingOperator, string> = {
      lime: '#08DE08',
      bird: '#2DCFF1',
      dott: '#E0120A'
    };
    return [
      this.createSvgProgressStyle(chargePercentage, fillColors[operator]),
      new Style({
        image: new Icon({
          src: `/icons/${vehicleType}.svg`,
          scale: 0.6,
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          color: borderColors[operator]
        }),
      })];
  }

  private createSvgProgressStyle(percentage: number, fillColor: string): Style {
    const svg = this.generateProgressSvg(percentage, {
      progressColor:
        percentage < 20 ? '#f44336' :
          percentage < 50 ? '#ffc107' :
            '#4caf50',
      fillColor
    });

    return new Style({
      image: new Icon({
        src: this.svgToDataUrl(svg),
        scale: 1,
        anchor: [0.5, 0.5],
      }),
    });
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

    // Example: simple location pin path
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

  private svgToDataUrl(svg: string): string {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
