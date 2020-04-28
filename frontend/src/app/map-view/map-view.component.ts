import { Component, OnInit, OnDestroy } from '@angular/core';
import 'leaflet';
import { GeoPoligonService } from '../services/geo-poligon.service';
import { takeWhile } from 'rxjs/operators';
import * as T from '@turf/turf';

const L = window['L'];

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, OnDestroy {

  private _alive: boolean = true;
  map: L.Map;
  osmBaseMap = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 24,
      maxNativeZoom: 19,
      attribution: '' }
  );
  satelliteBaseMap = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 24,
      maxNativeZoom: 17,
      attribution: ''  }
  );
  baseMaps = {'<span style="color: gray">OSM</span>': this.osmBaseMap,
              '<span style="color: gray">Satellite</span>': this.satelliteBaseMap};
  options = {
    layers: [this.satelliteBaseMap, this.osmBaseMap],
    zoom: 20,
    center: L.latLng(43.76503758337418, -79.402127588236),
    minZoom: 1,
    maxZoom: 20,
    // editable: true,
    zoomControl: true,
    worldCopyJump: true,
    maxBounds: [[-90, -180], [90,180]],
    maxBoundsViscosity: 0.95  
  };

  polygons: [] = [];
  currentView: any;
  currentViewPolygon: L.Polygon;
  bufferView1: any;
  bufferView1Polygon: L.Polygon;
  bufferView2: any;
  bufferView2Polygon: L.Polygon;
  
  currentViewPolygonLayer: L.FeatureGroup = new L.FeatureGroup();
  buffer1ViewPolygonLayer: L.FeatureGroup = new L.FeatureGroup();
  buffer2ViewPolygonLayer: L.FeatureGroup = new L.FeatureGroup();

  polygonLayer: L.FeatureGroup = new L.FeatureGroup();

  rawPolygons: [];
  polygonsToDisplay: [];

  constructor(private _geoPolygonService: GeoPoligonService) { }

  ngOnInit(): void {
    this.getPolygons();
    // this.polygonLayer['options'] = {
    //   minZoom: 14
    // };
  }

  ngOnDestroy(): void {
    this._alive = false;
  }

  async mapReady(map: L.Map) {
    this.map = map;
    let mapBounds = this.map.getBounds();
    let mapOutline = {
      uly: mapBounds.getNorthWest().lat,
      ulx: mapBounds.getNorthWest().lng,
      lry: mapBounds.getSouthEast().lat,
      lrx: mapBounds.getSouthEast().lng,
    }
    this.currentView = T.polygon(
      [
        [
          [mapOutline.uly, mapOutline.ulx],
          [mapOutline.uly, mapOutline.lrx],
          [mapOutline.lry, mapOutline.lrx],
          [mapOutline.lry, mapOutline.ulx],
          [mapOutline.uly, mapOutline.ulx]
        ]
      ]
    );
    this.bufferView1 = T.transformScale(this.currentView, 3);
    this.bufferView2 = T.transformScale(this.currentView, 5);

    this.map.addLayer(this.currentViewPolygonLayer);
    this.map.addLayer(this.buffer1ViewPolygonLayer);
    this.map.addLayer(this.buffer2ViewPolygonLayer);

    this.setCurrentViewBound([this.currentView.geometry.coordinates]);
    this.setBufferViewBounds([this.bufferView1.geometry.coordinates], [this.bufferView2.geometry.coordinates]);
    this.map.addLayer(this.polygonLayer);

    const buffer1Outline = new L.Polygon(T.transformScale(this.currentView, 3).geometry.coordinates).getBounds();
    const buffer1OutlineCoords = {
      uly: buffer1Outline.getNorthWest().lat,
      ulx: buffer1Outline.getNorthWest().lng,
      lry: buffer1Outline.getSouthEast().lat,
      lrx: buffer1Outline.getSouthEast().lng,
    }

    this._geoPolygonService.polygonListener().pipe(takeWhile(() => this._alive)).subscribe(resp => {
      this.rawPolygons = resp;

      if (this.map.getZoom() < 15) {
        this.polygonLayer.clearLayers();
        this.polygonLayer.eachLayer(l => {
          this.polygonLayer.removeLayer(l);
        });
      } else if (this.map.getZoom() < 19) {
        this.displayPolygons(true);
      } else {
        this.displayPolygons(false);
      }

    });

    this.loadPolygons(buffer1OutlineCoords);

  }

  onMapZoom(event: any):void{
    console.log('Zoom');
    // console.log(event);
    this.getPolygons();

    if (this.map.getZoom() < 15) {
      this.polygonLayer.clearLayers();
      this.polygonLayer.eachLayer(l => {
        this.polygonLayer.removeLayer(l);
      });
    } else if (this.map.getZoom() < 19) {
      this.displayPolygons(true);
    } else {
      this.displayPolygons(false);
    }
  }

  onMapMove(event: any):void{
    console.log('Move');
    // console.log(event);
    this.getPolygons();
  }

  getPolygons() {
    if (this.map){
      console.log(this.map.getZoom());

      let mapBounds = this.map.getBounds();
      let mapOutline = {
        uly: mapBounds.getNorthWest().lat,
        ulx: mapBounds.getNorthWest().lng,
        lry: mapBounds.getSouthEast().lat,
        lrx: mapBounds.getSouthEast().lng,
      }

      // if currentView is out of bufferVIew1
      console.log(this.currentView.geometry.coordinates[0]);
      console.log(this.bufferView1);
      this.currentView = T.polygon(
        [
          [
            [mapOutline.uly, mapOutline.ulx],
            [mapOutline.uly, mapOutline.lrx],
            [mapOutline.lry, mapOutline.lrx],
            [mapOutline.lry, mapOutline.ulx],
            [mapOutline.uly, mapOutline.ulx]
          ]
        ]
      );
      this.setCurrentViewBound([this.currentView.geometry.coordinates]);
      var ptsWithin = T.pointsWithinPolygon(T.points(this.currentView.geometry.coordinates[0]), this.bufferView1);
      
      if (ptsWithin.features.length < 5 && this.map.getZoom() > 10) {
        const buffer1Outline = new L.Polygon(T.transformScale(this.currentView, 3).geometry.coordinates).getBounds();
        const buffer1OutlineCoords = {
          uly: buffer1Outline.getNorthWest().lat,
          ulx: buffer1Outline.getNorthWest().lng,
          lry: buffer1Outline.getSouthEast().lat,
          lrx: buffer1Outline.getSouthEast().lng,
        }
        
        this.loadPolygons(buffer1OutlineCoords);

        // this.bufferView1 = T.transformScale(this.currentView, 3);
        // this.bufferView2 = T.transformScale(this.currentView, 5);
        // this.setBufferViewBounds([this.bufferView1.geometry.coordinates], [this.bufferView2.geometry.coordinates]);
      };
      
    }
    
  }

  loadPolygons(buffer1Outline) {
    this._geoPolygonService.getPolygons(buffer1Outline).pipe(takeWhile(() => this._alive)).subscribe(resp => {
      console.log(JSON.parse(resp.toString()).polygons);
      if (JSON.parse(resp.toString()).polygons.length > 0) {
        // JSON.parse(resp.toString()).polygons.forEach(polygon => {
        //   L.geoJSON(polygon).addTo(this.polygonLayer);
        // });

        this._geoPolygonService.updatePolygons(JSON.parse(resp.toString()).polygons);
      };
    });
  };

  setCurrentViewBound(bounds) {
    this.currentViewPolygonLayer.clearLayers();
    this.currentViewPolygon = new L.Polygon(bounds, {color: "#646464", fill: false});
    this.currentViewPolygon.addTo(this.currentViewPolygonLayer);
  }

  setBufferViewBounds(bounds1, bounds2) {
    this.buffer1ViewPolygonLayer.clearLayers();
    this.buffer2ViewPolygonLayer.clearLayers();
    this.bufferView1Polygon = new L.Polygon(bounds1, {color: "#00a9ff", fill: false}).addTo(this.buffer1ViewPolygonLayer);
    this.bufferView2Polygon = new L.Polygon(bounds2, {color: "#ff0c3e", fill: false}).addTo(this.buffer2ViewPolygonLayer);
  }

  getColorFromScore(score) {
    const lib = {0: '#ffebee', 1: '#fce4ec', 2: '#f3e5f5', 3: '#ede7f6',
      4: '#e8eaf6', 5: '#e3f2fd', 6: '#e1f5fe', 7: '#e0f7fa', 8: '#e0f2f1',
      9: '#e8f5e9', 10: '#f1f8e9'}
    return lib[score]
  }

  displayPolygons(simplified) {
    this.polygonLayer.clearLayers();
    if (simplified) {
      this.polygonsToDisplay = [];
      this.rawPolygons.map(p => {
        this.polygonsToDisplay.push(T.simplify(p, {tolerance: 0.00001, highQuality: true}));
      })
    } else {
      this.polygonsToDisplay = this.rawPolygons;
    }
    this.polygonsToDisplay.forEach(r => {
      let poly = L.geoJSON(r, {
        style: {fillColor: this.getColorFromScore(r['properties']['score'])}
      }).addTo(this.polygonLayer);
      poly.bindPopup(`${r['properties']['address']} : ${r['properties']['score']}`);
    });

  }
}
