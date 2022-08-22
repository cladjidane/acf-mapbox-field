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
      console.log(data)
      let bbox = turf.bbox(data)
      let bounds = turf.bboxPolygon(bbox)

      map.fitBounds(bounds, {
        padding: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      })

      field.value = JSON.stringify(bbox)
      map.getSource('route').setData(bounds)
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
      /*
      let line = turf.lineString(bounds)
      let polygon = turf.lineToPolygon(line)
      console.log(polygon)
      let bbox = turf.bboxPolygon(polygon)
      map.fitBounds(bbox, {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
        },
      })
      map.getSource('route').setData(turf.bboxPolygon(bbox))
      */
    }
  }, [bounds, map]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  )
}

export default App
