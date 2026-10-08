import { Component, OnInit, inject } from '@angular/core'
import { NavController } from '@ionic/angular'
import * as L from 'leaflet'
import { DataService } from '../data.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
  private dataService = inject(DataService);
  private navCtrl = inject(NavController)
  map!: L.Map

  constructor() {
    const iconDefault = L.icon({
      iconUrl: 'assets/icon/location-dot-solid.png',
      iconSize: [41, 41],
      iconAnchor: [20, 41],
      popupAnchor: [1, -34]
    })

    L.Marker.prototype.options.icon = iconDefault
  }

  ngOnInit() {
    if (!this.map) {
      setTimeout(() => {
        this.map = L.map('map').setView([-7.7956, 110.3695], 13)
        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ' &copy; OpenStreetMap contributors'
        })
        osm.addTo(this.map)

        // marker
        L.marker([-7.7956, 110.3695]).addTo(this.map)
          .bindPopup('yogyakarta')
          .openPopup()

        this.loadPoints();
      })
    }
  }

  goToCreate() {
    this.navCtrl.navigateForward('/createpoint')
  }

  async loadPoints() {
    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates =
          point.coordinates.split(',').map((c: string) =>
            parseFloat(c));
        const marker = L.marker(coordinates as
          L.LatLngExpression).addTo(this.map);
        marker.bindPopup(`${point.name}`);
      }
    }
    this.map.on('popupopen', (e) => {
      const popup = e.popup;
    });

  }
}
