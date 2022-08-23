import './App.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as turf from '@turf/turf'

import React, { useEffect, useRef, useState } from 'react'

import BoundsControl from './component/bounds/bounds'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { getBoundsByPoints } from './utils/helpers'
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
    //defaultMode: 'draw_polygon',
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
      if (
        data.features.length === 0 ||
        data.features[0].geometry.coordinates.length === 0
      ) {
        map.getSource('route').setData({
          type: 'FeatureCollection',
          features: [],
        })
        return
      }

      const coordinates = data.features[0].geometry.coordinates
      field.value = JSON.stringify(coordinates)
      map.getSource('route').setData(turf.bboxPolygon(turf.bbox(data)))

      // TimeOut néçessaire pour je ne sais quelle raison
      // Sans ça la première fois le fit ne marche pas mais en déplaçant un point ça marche bien
      // Ce petit timeout regle le soucis ??
      setTimeout(() => {
        map.fitBounds(getBoundsByPoints(coordinates), {
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

      if (bounds !== null) {
        let feature = turf.polygon(bounds)
        feature.id = '03542671a33354aa988e8f87999041c1'
        draw.add(feature)
        draw.changeMode('direct_select', {
          featureId: '03542671a33354aa988e8f87999041c1',
        })
      }
    })

    // Clean up on unmount
    return () => map.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (map && bounds !== null) {
      setTimeout(() => {
        map.fitBounds(getBoundsByPoints(bounds), {
          padding: 50,
        })
        map
          .getSource('route')
          .setData(turf.bboxPolygon(turf.bbox(turf.lineString(bounds[0]))))
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
