'use client';

import React from "react"
import { GeoJsonLoader, Map, Marker } from "pigeon-maps"

interface MapProps {
  marker: [number, number] | null;
  setMarker: (marker: [number, number]) => void;
  center: [number, number];
  setCenter: (center: [number, number]) => void;
}

// TODO: change map tiler to something nicer
export function MyMap({
  marker,
  setMarker,
  center,
  setCenter,
}: MapProps) {
  return (
    <Map
      height={500}
      width={500}
      defaultCenter={[33.6405, -117.8443]}
      center={center}
      defaultZoom={11}
      onClick={({ latLng }) => {
        setMarker(latLng);
        setCenter(latLng);
      }}
    >
      {marker && <Marker width={50} anchor={marker} />}
    </Map>
  )
}

interface MapGeoJsonProps {
  marker: [number, number] | null;
  setMarker: (marker: [number, number]) => void;
  center: [number, number];
  setCenter: (center: [number, number]) => void;
}

const geoJsonLink = 'https://raw.githubusercontent.com/dlustre/geodle/main/OC_Cities_Land_Boundaries.geojson';

// TODO: change map tiler to something nicer
export function MyMapGeoJson({
  marker,
  setMarker,
  center,
  setCenter,
}: MapGeoJsonProps) {
  return (
    <Map
      height={500}
      width={500}
      defaultCenter={[33.6405, -117.8443]}
      center={center}
      defaultZoom={11}
      onClick={({ latLng }) => {
        setMarker(latLng);
        setCenter(latLng);
      }}
    >
      <GeoJsonLoader
        link={geoJsonLink}
        styleCallback={(feature, hover) =>
          hover
            ? { fill: '#93c0d099', strokeWidth: '2' }
            : { fill: '#d4e6ec99', strokeWidth: '1' }
        }
      />
    </Map>
  )
}