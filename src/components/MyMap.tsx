'use client';

import React from "react"
import { Map, Marker } from "pigeon-maps"

// TODO: change map tiler to something nicer
export function MyMap({ marker, setMarker }: { marker: [number, number], setMarker: (marker: [number, number]) => void }) {
  return (
    <Map
      height={700}
      defaultCenter={[33.6405, -117.8443]}
      defaultZoom={11}
      onClick={({ latLng }) => {
        setMarker(latLng);
      }}
    >
      <Marker width={50} anchor={marker} />
    </Map>
  )
}

// import React from "react";
// import { Map, GeoJsonLoader } from "pigeon-maps";

// const geoJsonLink = "https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/2_bundeslaender/4_niedrig.geo.json"

// export const MyMap = () => (
//   <Map height={300} defaultCenter={[50.879, 4.6997]} defaultZoom={4}>
//     <GeoJsonLoader
//       link={geoJsonLink}
//       onClick={({ event, anchor, payload }) => {
//         console.log(event, anchor, payload);
//       }}
//       styleCallback={(feature, hover) =>
//         hover
//           ? { fill: '#93c0d099', strokeWidth: '2' }
//           : { fill: '#d4e6ec99', strokeWidth: '1' }
//       }
//     />
//   </Map>
// )