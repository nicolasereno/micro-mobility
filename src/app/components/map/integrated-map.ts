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
import {initialState} from '../../reducers/maps.reducer';
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
  private readonly positionVectorSource = new VectorSource({attributions: '© OSM contributors | OpenFreeMap'});
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
  private readonly stopCode = this.store.selectSignal<string | undefined>(stopCode);


  constructor() {
    this.view = new View({
      zoom: initialState.zoom,
      center: initialState.position
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
      console.log(this.stopCode());
      this.stopsLayer!.changed();
    });

    effect(() => {
      if (this.zoomToPositionTime()) {
        this.zoomToCurrentPosition();
      }
    });

    effect(() => {
      if (this.position() === undefined) {
        this.positionVectorSource.clear();
        return;
      }
      this.positionVectorSource.clear();
      const feature = new Feature({
        geometry: new Point(
          this.position()!
        )
      });
      feature.setStyle(new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: 'rgba(255, 255, 0, 0.6)',
          }),
          stroke: new Stroke({
            color: '#000000',
            width: 1,
          })
        }),
      }));
      this.positionVectorSource.addFeature(feature);
      const positionAccuracy = new Feature(new Circle(this.position()!, this.accuracy()));
      positionAccuracy.setStyle(new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 0, 0.3)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.6)',
          width: 0.5,
        })
      }))
      this.positionVectorSource.addFeature(positionAccuracy);
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
      feature.setStyle((feat: FeatureLike, res: number) => {
        if (res < 4) {
          return this.styleForElement(feat.getProperties()['operator'] as SharingOperator, feat.getProperties()['vehicleType'] as VehicleType, feat.getProperties()['percentageCharge'] as number)
        }
        return new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: PRIMARY_COLORS[feat.getProperties()['operator'] as SharingOperator],
            }),
            stroke: new Stroke({
              color: SECONDARY_COLORS[feat.getProperties()['operator'] as SharingOperator],
              width: 1,
            })
          }),
        })
      });
      return feature;
    })
  }


  ngOnInit(): void {
    VEHICLE_TYPES.forEach((vehicleType) => this.registry.getNamedSvgIcon(vehicleType, "symbols")
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
      minZoom: 13,
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
    const busStopStyle = (
      feature: FeatureLike,
      ignored: number
    ): Style => {
      const code = feature.get('c') ?? '';
      const isSelectedCode = this.stopCode() === code;
      const secondary = '#fff';
      const primary = '#000';
      const margin = 2;

      return new Style({
        text: new Text({
          text: String(code),
          font: 'bold 12px Arial',
          padding: [margin, 0, 0, margin],
          textAlign: 'center',
          textBaseline: 'middle',
          fill: isSelectedCode ? new Fill({color: secondary}) : new Fill({color: primary}),
          backgroundFill: isSelectedCode ? new Fill({color: primary}) : new Fill({color: secondary}),
          backgroundStroke: new Stroke({
            color: isSelectedCode ? secondary : primary,
            width: margin
          })
        })
      });
    };
    this.stopsLayer.setStyle(busStopStyle);
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
    // First zoom on latest zoom position
    if (this.center() && this.zoom()) {
      this.view.animate({
        center: [this.center()![0], this.center()![1]],
        zoom: this.zoom()!,
        duration: 500
      })
    }
    // Listen to positions change to store in local storage
    map.on('moveend', () => {
      this.changePosition();
    });
  }

  private styleForElement(operator: SharingOperator, vehicleType: VehicleType, chargePercentage: number) {
    const template = '<svg width="24px" height="24px" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">' + this.symbols[vehicleType] + '</svg>';
    const percentage = chargePercentage * 135 / 100;
    const vars = {arc: percentage, secondary: SECONDARY_COLORS[operator], primary: PRIMARY_COLORS[operator],}
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

  private zoomToCurrentPosition() {
    const untrackedPosition = untracked(() => this.position());
    this.view.animate({
      center: [untrackedPosition![0], untrackedPosition![1]],
      zoom: 18,
      duration: 500
    })
  }
}
