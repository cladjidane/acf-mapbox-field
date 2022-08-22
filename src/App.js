import './App.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as turf from '@turf/turf'

import React, { useEffect, useRef, useState } from 'react'

import BoundsControl from './component/bounds/bounds'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken =
  'pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg'

const App = ({ field }) => {
  const mapContainerRef = useRef(null)

  const [lng, setLng] = useState(5)
  const [lat, setLat] = useState(34)
  const [zoom, setZoom] = useState(1.5)
  const [map, setMap] = useState(null)
  const [bounds, setBounds] = useState(JSON.parse(field.value) || null)

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
  })
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
  })

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    })

    map.addControl(geocoder)
    map.addControl(draw)

    map.on('draw.create', updateArea)
    map.on('draw.delete', updateArea)
    map.on('draw.update', updateArea)

    function updateArea(e) {
      const data = draw.getAll()
      const coordinates = data.features[0].geometry.coordinates

      const bounding = new mapboxgl.LngLatBounds(
        coordinates[0][0],
        coordinates[0][0]
      )

      for (const coord of coordinates[0]) {
        bounding.extend(coord)
      }

      //const marker1 = new mapboxgl.Marker().setLngLat(bounding._ne).addTo(map)
      //const marker2 = new mapboxgl.Marker().setLngLat(bounding._sw).addTo(map)

      field.value = JSON.stringify(coordinates)
      map.getSource('route').setData(turf.bboxPolygon(turf.bbox(data)))

      // TimeOut néçessaire pour je ne sais quelle raison
      // Sans ça la première fois le fit ne marche pas mais en déplaçant un point ça marche bien
      // Ce petit timeout regle le soucis ??
      setTimeout(() => {
        map.fitBounds(bounding, {
          padding: 50,
        })
      }, 200)
    }

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4))
      setLat(map.getCenter().lat.toFixed(4))
      setZoom(map.getZoom().toFixed(2))
    })

    map.on('load', () => {
      setMap(map)
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': 'red',
          'line-width': 2,
          'line-offset': -10,
        },
      })
    })

    // Clean up on unmount
    return () => map.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (map && bounds !== null) {
      let polygon = turf.polygon(bounds)
      let features = turf.explode(polygon).features
      let bounding = new mapboxgl.LngLatBounds(bounds[0][0], bounds[0][0])

      for (const coord of bounds[0]) {
        bounding.extend(coord)
      }

      map.on('load', function () {
        for (const feature of turf.explode(polygon).features) {
          var featureIds = draw.add(feature)
          console.log('featureIds', featureIds)
        }
      })
      setTimeout(() => {
        map.fitBounds(bounding, {
          padding: 50,
        })
      }, 200)
    }
  }, [bounds, map]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="map-container" ref={mapContainerRef} />
    </div>
  )
}

export default App
