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
  const [bounds, setBounds] = useState(JSON.parse(field.value) || null)
  const [map, setMap] = useState(null)

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
  })
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
      polygon: true,
      trash: true,
    },
    // Set mapbox-gl-draw to draw by default.
    // The user does not have to click the polygon control button first.
    // defaultMode: 'draw_polygon',
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
      let bbox = turf.bbox(data)

      map.fitBounds(bbox, {
        padding: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      })

      map.getSource('route').setData(turf.bboxPolygon(bbox))
    }

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4))
      setLat(map.getCenter().lat.toFixed(4))
      setZoom(map.getZoom().toFixed(2))
    })

    // BOUNDS
    map.addControl(new BoundsControl(), 'top-right')
    map.on('bounds.get', () => {
      const b = map.getBounds()
      field.value = JSON.stringify(b)
      setBounds(b)
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
        layout: {
          //'line-join': 'round',
          //'line-cap': 'round',
        },
        paint: {
          'line-color': 'red',
          'line-width': 2,
          //'line-gap-width': 20,
          'line-offset': -10,
        },
      })
    })

    // Clean up on unmount
    return () => map.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (map && bounds !== null) {
      let line = turf.lineString([
        [bounds._sw.lng, bounds._sw.lat],
        [bounds._ne.lng, bounds._ne.lat],
      ])
      let bbox = turf.bbox(line)
      map.fitBounds(bbox, {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
        },
      })
      map.getSource('route').setData(turf.bboxPolygon(bbox))
    }
  }, [bounds, map]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  )
}

export default App
