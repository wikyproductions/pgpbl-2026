import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
  map!: L.Map;
  constructor() {
    const iconDefault = L.icon({
      iconUrl: 'assets/icon/location-dot-solid.png',
      iconSize: [41, 41],
      iconAnchor: [20, 41],
      popupAnchor: [1, -34]
    });

    L.Marker.prototype.options.icon = iconDefault;
  }


  ngOnInit() {
    if (!this.map) {
      setTimeout(() => {
        this.map = L.map('map').setView([-7.7956, 110.3695],
          13);
        var osm =
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: ' &copy; OpenStreetMap contributors' });
        osm.addTo(this.map);

        // marker
        L.marker([-7.7956, 110.3695]).addTo(this.map)
          .bindPopup('yogyakarta')
          .openPopup();
      });
    }
  }
}
