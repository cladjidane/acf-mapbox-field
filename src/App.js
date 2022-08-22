import './App.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import 'mapbox-gl/dist/mapbox-gl.css'

import React, { useEffect, useRef, useState } from 'react'

import BoundsControl from './component/bounds/bounds'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken =
  'pk.eyJ1IjoiamVvZnVuIiwiYSI6ImNrd3huZXZjMzAwMWkycXFtb29zeDMxdnMifQ.N0SyKbZ6Br7bCL0IPmUZIg'

const App = () => {
  const mapContainerRef = useRef(null)

  const [lng, setLng] = useState(5)
  const [lat, setLat] = useState(34)
  const [zoom, setZoom] = useState(1.5)
  const [bounds, setBounds] = useState(null)
  const [map, setMap] = useState(null)

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
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

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4))
      setLat(map.getCenter().lat.toFixed(4))
      setZoom(map.getZoom().toFixed(2))
    })

    // BOUNDS
    map.addControl(new BoundsControl(), 'top-right')
    map.on('bounds.get', () => setBounds(map.getBounds()))

    map.on('load', () => {
      setMap(map)
    })

    // Clean up on unmount
    return () => map.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mapContainerRef.current && bounds !== null) {
      const bbox = bounds
      map.fitBounds(bbox, {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
        },
      })
    }
  }, [bounds]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebarStyle'>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} | Bounds:{' '}
          {JSON.stringify(bounds)}
        </div>
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  )
}

export default App
