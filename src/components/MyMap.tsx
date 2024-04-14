'use client';

import React from "react"
import { GeoJsonLoader, Map, Point } from "pigeon-maps"
import { orange_county_cities } from "~/utils/constants";
import { getMinMaxCoords } from "~/app/page";

interface MapGeoJsonProps {
  setHoveredCity: (city: string | null) => void;
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  coords: Point | null;
  setCoords: (center: Point | null) => void;
}

interface GeoJson {
  type: string;
  features: {
    type: string;
    properties: {
      NAME: string;
    };
    geometry: {
      type: string;
      coordinates: Point[];
    };
  }[];
}

interface GeoJsonCallbackProps {
  event: MouseEvent;
  anchor: Point;
  payload: GeoJson["features"][0];
}

const geoJsonLink = 'https://raw.githubusercontent.com/dlustre/geodle/main/OC_Cities_Land_Boundaries.geojson';

// TODO: change map tiler to something nicer
export function MyMapGeoJson({
  setHoveredCity,
  selectedCity,
  setSelectedCity,
  coords,
  setCoords,
}: MapGeoJsonProps) {
  return (
    <Map
      height={500}
      width={500}
      defaultCenter={[33.6405, -117.8443]}
      center={coords ?? undefined}
      defaultZoom={11}
    >
      <GeoJsonLoader
        link={geoJsonLink}
        onMouseOver={({ payload }: GeoJsonCallbackProps) => {
          if (!orange_county_cities.includes(payload.properties.NAME)) return;
          setHoveredCity(payload.properties.NAME);
        }}
        onClick={({ payload }: GeoJsonCallbackProps) => {
          if (!orange_county_cities.includes(payload.properties.NAME)) return;
          setSelectedCity(payload.properties.NAME);
          const { minLat, maxLat, minLong, maxLong } = getMinMaxCoords(payload.properties.NAME)!;
          setCoords([(minLat + maxLat) / 2, (minLong + maxLong) / 2]);
        }}
        styleCallback={(feature: GeoJson["features"][0], hover: boolean) => {
          if (!orange_county_cities.includes(feature.properties.NAME)) return {};
          if (selectedCity === feature.properties.NAME) return { fill: '#2957d8b5', strokeWidth: '2' };
          return hover
            ? { fill: '#93c0d099', strokeWidth: '2' }
            : { fill: '#d4e6ec99', strokeWidth: '1' }
        }}
      />
    </Map>
  )
}