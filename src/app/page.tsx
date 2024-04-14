'use client';

import { FormEvent, useEffect, useState } from "react";
import { MyMapGeoJson } from "~/components/MyMap";
import { getGeoInfoFromCoords, getZips } from "./server-actions";
import { orange_county_cities } from "~/utils/constants";
import { data } from "../../OC_Zip_Dataset.json";
import type { Point } from "pigeon-maps";
import { get } from "node_modules/axios/index.cjs";
import { useFormStatus } from "react-dom";

const MAX_GUESSES = 5;

interface Guess {
  city: string;
  region: string;
  population: number;
  medianHomeValue: number;
  lat: number;
  lng: number;
}

interface City {
  name: string;
  region: string;
  population: number;
  medianHomeValue: number;
  maxLat: number;
  minLat: number;
  maxLong: number;
  minLong: number;
}

const ucirvine_coords: Point = [33.6405, -117.8443];

function randomCity() {
  return orange_county_cities[Math.floor(Math.random() * orange_county_cities.length)];
}

function getFieldFromCity(fieldName: string, city: string) {
  const cityData = data.find((cityData) => cityData.City === city.toUpperCase());
  if (!cityData) return null;
  console.log(cityData);
  return cityData[fieldName];
}

// check each zip code in the city and return the min and max lat and long from the zip codes
export function getMinMaxCoords(city: string): { maxLat: number, minLat: number, maxLong: number, minLong: number } | null {
  console.log(`getMinMaxCoords ${city}`);
  const cityData = data.filter((cityData) => cityData.City === city.toUpperCase());
  if (!cityData) return null;
  console.log(cityData);
  // console.log(cityData[0]!.Latitude);
  // console.log(cityData[0]!.Longitude);
  const maxLat = Math.max(...cityData.map((cityData) => Number(cityData.Latitude)));
  const minLat = Math.min(...cityData.map((cityData) => Number(cityData.Latitude)));
  const maxLong = Math.max(...cityData.map((cityData) => Number(cityData.Longitude)));
  const minLong = Math.min(...cityData.map((cityData) => Number(cityData.Longitude)));
  console.log(`maxLat: ${maxLat}, minLat: ${minLat}, maxLong: ${maxLong}, minLong: ${minLong}`);
  return { maxLat, minLat, maxLong, minLong };
}

export default function HomePage() {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [coords, setCoords] = useState<Point | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  // const { pending } = useFormStatus();

  useEffect(() => {
    // getZips()
    //   .then(() => {
    //     console.log("Zips loaded");
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
    const newCity = randomCity() as string;
    setTargetCity({
      name: newCity,
      region: getFieldFromCity("Region", newCity) as string ?? "Unknown",
      population: Number(getFieldFromCity("TotalPopulation", newCity)) ?? 0,
      medianHomeValue: Number(getFieldFromCity("MedianHomeValue", newCity)) ?? 0,
      ...getMinMaxCoords(newCity)!,
    } satisfies City);
  }, []);

  function GameEndModal() {
    return (
      <div className="size-full bg-black bg-opacity-20 flex flex-col items-center justify-center">
        <div>Game Over</div>
        <button
          onClick={() => {
            setCoords(null);
            setGuesses([]);
            const newCity = randomCity() as string;
            setTargetCity({
              name: newCity,
              region: getFieldFromCity("Region", newCity) as string ?? "Unknown",
              population: Number(getFieldFromCity("TotalPopulation", newCity)) ?? 0,
              medianHomeValue: Number(getFieldFromCity("MedianHomeValue", newCity)) ?? 0,
              ...getMinMaxCoords(newCity)!,
            } satisfies City);
            setGameState("playing");
          }}
        >
          Play Again
        </button>
      </div>
    )
  }

  if (!targetCity) return;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    console.log(`onSubmit ${coords} ${targetCity.name} ${selectedCity}`);
    if (!coords) return;
    if (!targetCity) return;
    if (!selectedCity) return;
    event.preventDefault();
    console.log('Before getGeoInfoFromCoords, coords: ', coords[0].toString(), coords[1].toString());
    const guessInfo = await getGeoInfoFromCoords(coords[0].toString(), coords[1].toString());
    console.log('guessInfo: ', guessInfo);
    if (!guessInfo) return;

    console.log("region", getFieldFromCity("Region", guessInfo.City) as string ?? "Unknown");

    const guess = {
      city: guessInfo.City,
      region: getFieldFromCity("Region", guessInfo.City) as string ?? "Unknown",
      population: Number(getFieldFromCity("TotalPopulation", guessInfo.City)) ?? 0,
      medianHomeValue: Number(getFieldFromCity("MedianHomeValue", guessInfo.City)) ?? 0,
      lat: Number(guessInfo.Latitude),
      lng: Number(guessInfo.Longitude),
    } satisfies Guess;
    setGuesses((oldGuesses) => [
      ...oldGuesses,
      guess,
    ]);

    if (guess.city === targetCity.name) {
      setGameState("won");
      alert("You won!");
    }

    if (guesses.length + 1 >= MAX_GUESSES) {
      setGameState("lost");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#70c6e7] to-[#1a2092] text-white">
      <div className="container flex flex-row items-center justify-center gap-12 px-4 py-16 ">

        <div className="flex flex-col w-4/5 h-2/3">
          {`dev: city: ${targetCity.name}`}
          {gameState !== "playing" && <GameEndModal />}
          <div className="flex flex-col items-center justify-center bg-slate-800 rounded-md border-4 border-white">
            <div className="flex flex-row space-x-4 p-4 bg-slate-800 justify-between w-full px-4">
              <div>City</div>
              <div>Region</div>
              <div>Population</div>
              <div>Median Home Value</div>
              <div>Latitude</div>
              <div>Longitude</div>
            </div>
            {guesses.map((guess: Guess, i) => (
              <div key={i} className="flex flex-row space-x-4 p-4 bg-slate-800 justify-between w-full border-t-2 border-dashed border-white">
                <div>{guess.city}</div>
                <div>{guess.region}</div>
                <div>{guess.population}</div>
                <div>{guess.medianHomeValue}</div>
                <div>{guess.lat}{guess.lat === ucirvine_coords[0] ? "Equal" : guess.lat > ucirvine_coords[0] ? "Greater" : "Less"}</div>
                <div>{guess.lng}{guess.lng === ucirvine_coords[1] ? "Equal" : guess.lng > ucirvine_coords[1] ? "Greater" : "Less"}</div>
              </div>
            ))}
            {Array
              .from({ length: MAX_GUESSES - guesses.length })
              .map((_, i) => (
                <div key={i} className="flex flex-row space-x-4 p-4 bg-slate-800 justify-center w-full border-t-2 border-dashed border-white">
                  {guesses.length + i + 1}
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <MyMapGeoJson
            setHoveredCity={setHoveredCity}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            coords={coords}
            setCoords={setCoords}
          />
          {hoveredCity &&
            <>
              <div>{hoveredCity}</div>
              <form onSubmit={onSubmit}>
                <button
                  type="submit"
                  className="bg-white text-black p-4 rounded-2xl font-bold"
                >
                  Confirm
                </button>
              </form>
            </>
          }
        </div>
      </div>
    </main>
  );
}