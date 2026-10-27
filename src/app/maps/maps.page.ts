import { Component, OnInit, inject } from '@angular/core'
import { NavController } from '@ionic/angular'
import * as L from 'leaflet'
import { DataService } from '../data.service'

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {
  private dataService = inject(DataService)
  private navCtrl = inject(NavController)
  map!: L.Map

  constructor() {
    const customIcon = L.icon({
      iconUrl: 'assets/icon/location-dot-solid.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    })

    L.Marker.prototype.options.icon = customIcon
  }

  ngOnInit() {
    if (!this.map) {
      setTimeout(() => {
        this.map = L.map('map').setView([-7.7956, 110.3695], 13)
        var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ' © OpenStreetMap contributors'
        })
        osm.addTo(this.map)

        this.loadPoints()
      })
    }
  }

  goToCreate() {
    this.navCtrl.navigateForward('/createpoint')
  }

  async loadPoints() {
    const points: any = await this.dataService.getPoints()
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key]
        const coordinates =
          point.coordinates.split(',').map((c: string) =>
            parseFloat(c))
        const marker = L.marker(coordinates as
          L.LatLngExpression).addTo(this.map)

        marker.bindPopup(`
          <div style="text-align: center; min-width: 180px; padding: 2px 0;">
            <b style="font-size: 14px; display: block; margin-bottom: 8px;">${point.name}</b>
            <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
              <a href="/editpoint/${key}" style="background-color: #ffc107; color: #000000; border-radius: 6px; padding: 5px 8px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                <img src="assets/icon/pen-to-square-solid.png" style="width: 12px; height: 12px;" /> Edit
              </a>
              <a href="#" class="delete-link" data-key="${key}" style="background-color: #dc3545; color: #ffffff; border-radius: 6px; padding: 5px 8px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                <img src="assets/icon/trash-solid.png" style="width: 12px; height: 12px; filter: brightness(0) invert(1);" /> Delete
              </a>
            </div>
          </div>
        `, { minWidth: 200 })
      }
    }

    this.map.on('popupopen', (e) => {
      const popup = e.popup
      const deleteLink = popup.getElement()?.querySelector('.delete-link')

      if (deleteLink) {
        deleteLink.addEventListener('click', (event) => {
          event.preventDefault()
          const key = (event.target as HTMLElement).dataset['key']
          if (key) {
            this.deletePoint(key, popup.getLatLng())
          }
        })
      }
    })
  }

  async deletePoint(key: string, latLng: L.LatLng | undefined) {
    await this.dataService.deletePoint(key)

    if (latLng) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          if (layer.getLatLng().equals(latLng)) {
            this.map.removeLayer(layer)
          }
        }
      })
    }
  }
}
