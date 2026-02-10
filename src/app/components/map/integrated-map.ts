import {Component, effect, inject, OnInit, untracked} from '@angular/core';
import {Feature, MapBrowserEvent, View} from 'ol';
import {MapboxVectorLayer} from 'ol-mapbox-style';
import Map from 'ol/Map';
import {Store} from '@ngrx/store';
import {
  accuracy,
  allVehicles,
  center,
  minimumCharge,
  operatorsVisible,
  position,
  preferredStops,
  selectedVehicleId,
  stopCode,
  vehicleTypesVisible,
  zoom,
  zoomToPositionTime
} from '../../reducers';
import {
  PRIMARY_COLORS,
  SECONDARY_COLORS,
  SHARING_OPERATORS,
  SharingOperator,
  Vehicle,
  VEHICLE_TYPES,
  VehicleType
} from '../../model/model';
import {Fill, Icon, Stroke, Style} from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Circle, Geometry, Point} from 'ol/geom';
import {MapsActions} from '../../actions/maps.actions';
import {Coordinate} from 'ol/coordinate';
import CircleStyle from 'ol/style/Circle';
import {FeatureLike} from 'ol/Feature';
import {GeoJSON} from 'ol/format';
import Text from 'ol/style/Text';
import {BusesActions} from '../../actions/buses.actions';
import {VehiclesActions} from '../../actions/vehicles.actions';
import {MatIconRegistry} from '@angular/material/icon';
import {take} from 'rxjs';

@Component({
  selector: 'app-integrated-map',
  imports: [],
  templateUrl: './integrated-map.html',
  styleUrl: './integrated-map.scss',
  standalone: true
})
export class IntegratedMap implements OnInit {

  private readonly vehiclesVectorSource = new VectorSource();
  private readonly positionVectorSource = new VectorSource();
  private readonly view: View;

  private stopsLayer: VectorLayer | null = null;
  private vehiclesLayer: VectorLayer | null = null;

  private store = inject(Store)
  private registry = inject(MatIconRegistry);

  private symbols: Record<string, string> = {};

  private readonly vehicles = this.store.selectSignal<Record<SharingOperator, Vehicle[]>>(allVehicles);
  private readonly position = this.store.selectSignal<Coordinate | undefined>(position);
  private readonly zoom = this.store.selectSignal<number | undefined>(zoom);
  private readonly center = this.store.selectSignal<Coordinate | undefined>(center);
  private readonly accuracy = this.store.selectSignal<number | undefined>(accuracy);
  private readonly zoomToPositionTime = this.store.selectSignal<number | undefined>(zoomToPositionTime);
  private readonly vehicleTypesVisible = this.store.selectSignal<Record<VehicleType, boolean>>(vehicleTypesVisible);
  private readonly operatorsVisible = this.store.selectSignal<Record<SharingOperator, boolean>>(operatorsVisible);
  private readonly minimumCharge = this.store.selectSignal<number>(minimumCharge);
  private readonly selectedStopCode = this.store.selectSignal<string | undefined>(stopCode);
  private readonly selectedVehicleId = this.store.selectSignal<string | undefined>(selectedVehicleId);
  private readonly preferredStops = this.store.selectSignal<string[]>(preferredStops);

  constructor() {
    this.view = new View({
      zoom: this.zoom(),
      center: this.center()
    });
    effect(() => {
      if (this.operatorsVisible()) {
        this.vehiclesVectorSource.clear();
        for (const operator of SHARING_OPERATORS) {
          this.vehiclesVectorSource
            .addFeatures(this.toFeatures(this.vehicles()[operator]
              .filter(v => this.minimumCharge() <= v.percentageCharge)
              .filter(v => this.operatorsVisible()[operator] && (this.vehicleTypesVisible()[v.vehicleType]))));
        }
      }
    });

    effect(() => {
      console.debug(this.selectedStopCode());
      this.stopsLayer!.changed();
    });

    effect(() => {
      console.debug(this.selectedVehicleId());
      this.vehiclesLayer!.changed();
    });

    effect(() => {
      if (this.zoomToPositionTime()) {
        this.zoomToCurrentPosition();
      }
    });

    effect(() => {
      this.positionVectorSource.clear();
      if (this.position() === undefined) {
        return;
      }

      const feature = new Feature({
        geometry: new Point(
          this.position()!
        )
      });
      const positionAccuracyFeature = new Feature(new Circle(this.position()!, this.accuracy()));

      feature.setStyle(this.positionStyle());
      positionAccuracyFeature.setStyle(this.accuracyStyle())

      this.positionVectorSource.addFeature(feature);
      this.positionVectorSource.addFeature(positionAccuracyFeature);
    })
  }

  private changePosition() {
    const zoom = this.view.getZoom();
    const center = this.view.getCenter();
    if (center && zoom) {
      this.store.dispatch(MapsActions.changeMapPosition({center, zoom}))
    }
  }

  private toFeatures(vv: Vehicle[]): Feature<Geometry>[] {
    return vv.map(v => {
      const feature = new Feature({
        geometry: new Point(
          v.coordinates
        ),
        vehicleId: v.id,
        operator: v.operator,
        vehicleType: v.vehicleType,
        percentageCharge: v.percentageCharge
      });
      const isSelected = this.selectedVehicleId() === v.id
      feature.setStyle((feat: FeatureLike, res: number) => {
        if (res < 4) {
          return this.styleForVehicle(
            feat.getProperties()['operator'] as SharingOperator,
            feat.getProperties()['vehicleType'] as VehicleType,
            feat.getProperties()['percentageCharge'] as number,
            isSelected)
        }
        return this.smallStyleForVehicle(feat.getProperties()['operator'] as SharingOperator)
      });
      return feature;
    })
  }

  ngOnInit(): void {
    [...VEHICLE_TYPES, 'bus'].forEach((vehicleType) => this.registry.getNamedSvgIcon(vehicleType, "symbols")
      .pipe(take(1))
      .subscribe(e => this.symbols[vehicleType] = e.innerHTML))

    const map = new Map({
      target: 'map',
      view: this.view,
      controls: [],
    });
    const openstreetmap = new MapboxVectorLayer({
      styleUrl: 'openstreetmap.json',
    });
    this.vehiclesLayer = new VectorLayer({
      source: this.vehiclesVectorSource,
      minZoom: 14,
      maxZoom: 24,
    });
    this.stopsLayer = new VectorLayer({
      source: new VectorSource({
        url: 'stops.json',
        format: new GeoJSON(),
      }),
      minZoom: 16,
      maxZoom: 24,
    });
    this.stopsLayer.setStyle(
      (feature: FeatureLike): Style[] => this.styleForBusStop(feature.get('c') ?? ''));

    map.on('singleclick', (event: MapBrowserEvent) => {
      const stopFeature = map.forEachFeatureAtPixel(
        event.pixel,
        (f: FeatureLike) => f,
        {
          layerFilter: (layer) => layer === this.stopsLayer
        }
      );
      if (stopFeature) {
        const code = stopFeature.get('c');
        this.store.dispatch(BusesActions.loadBuses({stopCode: code}));
      }

      const vehicleFeature = map.forEachFeatureAtPixel(
        event.pixel,
        (f: FeatureLike) => f,
        {
          layerFilter: (layer) => layer === this.vehiclesLayer
        }
      );
      if (vehicleFeature) {
        const operator = vehicleFeature.get('operator') as SharingOperator;
        const id = vehicleFeature.get('vehicleId') as string;
        this.store.dispatch(VehiclesActions.selectVehicle({operator, id}));
      }
    });
    map.addLayer(openstreetmap);
    map.addLayer(this.stopsLayer);
    map.addLayer(this.vehiclesLayer);
    map.addLayer(new VectorLayer({
      source: this.positionVectorSource,
    }));
    // Listen to positions change to store in local storage
    map.on('moveend', () => {
      this.changePosition();
    });
  }

  private styleForBusStop(code: string) {
    const isSelected = this.selectedStopCode() === code;
    const isPreferred = this.preferredStops().indexOf(code) >= 0;
    const primary = this.getThemeColor('--mat-sys-inverse-primary', true);
    const secondary = this.getThemeColor('--mat-sys-primary', true);
    const tertiary = this.getThemeColor('--mat-sys-tertiary', true);
    const template = '<svg width="24px" height="24px" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">' + this.symbols['bus'] + '</svg>';
    const vars = {
      primary: isSelected ? primary : (isPreferred ? tertiary : secondary),
      secondary: isSelected ? (isPreferred ? tertiary : secondary) : primary,
    };
    // @ts-ignore
    const svg = template.replace(/\$\{(\w+)}/g, (_, key) => vars[key]);
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

    return [
      new Style({
        image: new Icon({
          src: url,
          scale: 1,
          anchor: [0.5, 1],
        }),
      }),
      new Style({
      text: new Text({
        text: String(code),
        font: 'bold 12px Arial',
        textAlign: 'center',
        textBaseline: 'top',
        fill: new Fill({color: isSelected ? primary : (isPreferred ? tertiary : secondary)})
      })
    })];
  }

  private styleForVehicle(operator: SharingOperator, vehicleType: VehicleType, chargePercentage: number, isSelected: boolean) {
    const template = '<svg width="24px" height="24px" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">' + this.symbols[vehicleType] + '</svg>';
    const percentage = chargePercentage * 135 / 100;
    const vars = {
      arc: percentage,
      secondary: isSelected ? PRIMARY_COLORS[operator] : SECONDARY_COLORS[operator],
      primary: isSelected ? SECONDARY_COLORS[operator] : PRIMARY_COLORS[operator]
    }
    // @ts-ignore
    const svg = template.replace(/\$\{(\w+)}/g, (_, key) => vars[key]);
    const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

    return new Style({
      image: new Icon({
        src: url,
        scale: 1.5,
        anchor: [0.5, 0.5],
      }),
    });
  }

  private smallStyleForVehicle(sharingOperator: SharingOperator) {
    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: PRIMARY_COLORS[sharingOperator],
        }),
        stroke: new Stroke({
          color: SECONDARY_COLORS[sharingOperator],
          width: 1,
        })
      }),
    });
  }

  private accuracyStyle() {
    const baseColor = this.getThemeColor('--mat-sys-tertiary', true);
    return new Style({
      fill: new Fill({
        color: this.hexToRgba(baseColor, 0.3),
      }),
      stroke: new Stroke({
        color: this.hexToRgba(baseColor, 0.6),
        width: 0.5,
      })
    });
  }

  private getThemeColor(variable: string, lightColor: boolean) {
    const [, light, dark] = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim()
      .match(/light-dark\(([^,]+),\s*([^)]+)\)/)!;

    return lightColor ? light : dark;
  }

  private positionStyle() {
    const baseColor = this.getThemeColor('--mat-sys-tertiary', true);
    return new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({
          color: this.hexToRgba(baseColor, 0.8),
        }),
        stroke: new Stroke({
          color: baseColor,
          width: 1,
        })
      }),
    });
  }

  private hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private zoomToCurrentPosition() {
    const untrackedPosition = untracked(() => this.position());
    this.view.animate({
      center: [untrackedPosition![0], untrackedPosition![1]],
      zoom: 18,
      duration: 500
    })
  }
}
