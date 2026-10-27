import { Component, inject, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NavController, AlertController } from '@ionic/angular'
import { DataService } from '../data.service'
import * as L from 'leaflet'

const customIcon = L.icon({
  iconUrl: 'assets/icon/location-dot-solid.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})
L.Marker.prototype.options.icon = customIcon

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: false
})
export class EditpointPage implements OnInit {
  map!: L.Map
  key = ''
  name = ''
  coordinates = ''
  description = ''
  private route = inject(ActivatedRoute)
  private navCtrl = inject(NavController)
  private alertCtrl = inject(AlertController)
  private dataService = inject(DataService)

  constructor() {}

  async ngOnInit() {
    this.key = this.route.snapshot.paramMap.get('key') || ''
    const point: any = await this.dataService.getPoint(this.key)
    this.name = point.name
    this.coordinates = point.coordinates
    this.description = point.description

    this.map = L.map('mapedit').setView(point.coordinates.split(','), 13)

    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    })

    var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'ESRI'
    })

    osm.addTo(this.map)

    var baseMaps = {
      "OpenStreetMap": osm,
      "Esri World Imagery": esri
    }
    L.control.layers(baseMaps).addTo(this.map)

    var tooltip = 'Drag the marker or move the map to change the coordinates of the location'
    var marker = L.marker(point.coordinates.split(','), { draggable: true })

    marker.addTo(this.map)
    marker.bindPopup(tooltip)
    marker.openPopup()

    marker.on('dragend', (e) => {
      let latlng = e.target.getLatLng()
      let lat = latlng.lat.toFixed(9)
      let lng = latlng.lng.toFixed(9)
      this.coordinates = lat + ',' + lng
    })
  }

  async save() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.updatePoint(this.key, { name: this.name, coordinates: this.coordinates })
        this.navCtrl.back()
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        })
        await alert.present()
      }
    }
  }
}
