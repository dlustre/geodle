'use client';

import { useEffect, useState } from "react";
import { MyMapGeoJson } from "~/components/MyMap";
import { getGeoInfoFromCoords } from "./server-actions";
import { OrangeCountyCities } from "~/utils/constants";
import ZipData from "../../OC_Zip_Dataset.json";
import type { Point } from "pigeon-maps";
import { useFormStatus } from "react-dom";
import getMinMaxCoords from "~/utils/getMinMaxCoords";
import Image from "next/image";
import { LoaderCircle } from 'lucide-react';
import { motion } from "framer-motion";

const MAX_GUESSES = 7;

// threshold values to determine if a guess is close to the target
const THRESHOLDS = {
  population: 10_000,
  medianHomeValue: 25_000,
  lat: 0.3,
  lng: 0.3,
} as const;

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

const rowVariants = {
  initial: {
    opacity: 0,
    x: "-5px",
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const buttonStyle = "bg-white transition-all text-black p-4 rounded-3xl font-bold flex flex-row items-center text-xl ring-4";

function randomCity() {
  return OrangeCountyCities[Math.floor(Math.random() * OrangeCountyCities.length)];
}

function getFieldFromCity(
  fieldName: "Region" | "TotalPopulation" | "MedianHomeValue",
  city: string) {
  const cityData = ZipData.data.find((cityData) => cityData.City === city.toUpperCase());
  if (!cityData) return null;
  // console.log(cityData);
  return cityData[fieldName];
}

// Return green checkmark if value is equal to target, up arrow if value is greater than target, down arrow if value is less than target, if value is close to target return a yellow tilde
function getResult(value: number, field: keyof typeof THRESHOLDS, target: number) {
  if (value === target) return "✅";
  if (value > target) return "⬇";
  if (value < target) return "⬆";
  if (Math.abs(value - target) < THRESHOLDS[field]) return "~";
}

export default function Geodle() {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [coords, setCoords] = useState<Point | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [guessedCities, setGuessedCities] = useState<string[]>([]);
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");

  function SubmitButton({ selectedCity }: { selectedCity: string | null }) {
    const { pending } = useFormStatus();
    const disabled = !selectedCity || guessedCities.includes(selectedCity) || pending || gameState !== "playing";
    return (
      <button
        disabled={disabled}
        className={`${disabled ? 'brightness-50' : 'hover:bg-green-800 hover:text-white'} ring-4 bg-white transition-all text-black p-4 rounded-3xl font-bold flex flex-row items-center gap-2 text-xl`}
      >
        {pending && <LoaderCircle size={25} color="black" className="animate-spin" />}{selectedCity ? `Guess ${selectedCity}` : "Select a city"}
      </button>
    );
  }

  useEffect(() => {
    const newCity = randomCity() as string;
    setTargetCity({
      name: newCity,
      region: getFieldFromCity("Region", newCity) ?? "Unknown",
      population: Number(getFieldFromCity("TotalPopulation", newCity)) ?? 0,
      medianHomeValue: Number(getFieldFromCity("MedianHomeValue", newCity)) ?? 0,
      ...getMinMaxCoords(newCity)!,
    } satisfies City);
  }, []);

  function BottomButtons() {
    return (
      <>
        <div className="absolute -bottom-8 left-16">
          {gameState !== "playing" && (
            <motion.div
              className={buttonStyle}
            >
              You {gameState}! (The city was {targetCity?.name})
            </motion.div>
          )}
          {/* <div className={buttonStyle}>You {gameState}!</div> */}
        </div>
        <div className="absolute -bottom-8 right-16">
          <button
            className={`${buttonStyle} hover:bg-red-800 hover:text-white`}
            onClick={() => {
              setCoords(null);
              setGuesses([]);
              setGuessedCities([]);
              setSelectedCity(null);
              const newCity = randomCity() as string;
              setTargetCity({
                name: newCity,
                region: getFieldFromCity("Region", newCity) ?? "Unknown",
                population: Number(getFieldFromCity("TotalPopulation", newCity)) ?? 0,
                medianHomeValue: Number(getFieldFromCity("MedianHomeValue", newCity)) ?? 0,
                ...getMinMaxCoords(newCity)!,
              } satisfies City);
              setGameState("playing");
            }}
          >
            {gameState === "playing" ? "Restart" : "Play Again"}
          </button>
        </div>
      </>
    )
  }

  if (!targetCity) return;

  async function onSubmit() {
    if (!coords) return;
    if (!targetCity) return;
    if (!selectedCity) return;
    console.log('Before getGeoInfoFromCoords, coords: ', coords[0].toString(), coords[1].toString());
    const guessInfo = await getGeoInfoFromCoords(coords[0].toString(), coords[1].toString());
    console.log('guessInfo: ', guessInfo);
    if (!guessInfo) return;

    console.log("region", getFieldFromCity("Region", guessInfo.City) ?? "Unknown");

    const guess = {
      city: selectedCity,
      region: getFieldFromCity("Region", selectedCity) ?? "Unknown",
      population: Number(getFieldFromCity("TotalPopulation", selectedCity)) ?? 0,
      medianHomeValue: Number(getFieldFromCity("MedianHomeValue", selectedCity)) ?? 0,
      lat: Number(guessInfo.Latitude),
      lng: Number(guessInfo.Longitude),
    } satisfies Guess;
    setGuesses((oldGuesses) => [
      ...oldGuesses,
      guess,
    ]);
    setGuessedCities((oldCities) => [
      ...oldCities,
      selectedCity,
    ]);

    if (guess.city === targetCity.name) setGameState("won");
    else if (guesses.length + 1 >= MAX_GUESSES) setGameState("lost");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#70c6e7] to-[#1a2092] text-white">
      <div className="relative flex flex-col items-center -translate-y-12 pb-12 drop-shadow-lg">
        <Image
          className=""
          src="/geodle.svg"
          alt="Geodle"
          width={300}
          height={300}
        />
        <Image
          className="absolute top-4 left-1/2 transform -translate-x-1/2"
          src="/line.svg"
          alt="line"
          width={500}
          height={400}
        />
        <Image
          className="absolute top-8 left-1/2 transform -translate-x-1/2"
          src="/line.svg"
          alt="line"
          width={500}
          height={400}
        />
      </div>
      <Image
        className="absolute top-28 right-0"
        src="/three.svg"
        alt="Geodle"
        width={800}
        height={800}
      />
      <Image
        className="absolute top-16 left-8"
        src="/two.svg"
        alt="Geodle"
        width={600}
        height={600}
      />
      <div className="container flex flex-row items-center justify-center gap-12 px-2 z-10">
        <div className="flex flex-col w-full h-[90%]">
          {/* {`dev: city: ${targetCity.name}`} */}
          <div className="w-[50vw] h-full flex flex-col items-center justify-center bg-slate-800 rounded-md ring-8 relative">
            <table className="w-full font-bold">
              <colgroup>
                {/* <col span={1} style={{
                  borderRight: "2px dashed white",
                }} /> */}
                <col style={{ width: "20%" }} />
              </colgroup>
              <tr className="h-20 p-8">
                <th className="text-xl">City</th>
                <th>Region</th>
                <th>Population</th>
                <th>Median Home Value</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
              {guesses.map((guess: Guess, i) => (
                <motion.tr
                  key={i}
                  className="text-center border-t-2 border-dashed border-white h-20 font-bold hover:bg-slate-700 transition-all"
                  initial="initial"
                  variants={rowVariants}
                  animate="animate"
                >
                  <motion.td variants={rowVariants} className="text-xl">{guess.city}{guess.city === targetCity.name && "✅"}</motion.td>
                  <motion.td variants={rowVariants}>{guess.region}{guess.region === targetCity.region && "✅"}</motion.td>
                  <motion.td variants={rowVariants}>{guess.population}{getResult(guess.population, "population", targetCity.population)}</motion.td>
                  <motion.td variants={rowVariants}>{(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })).format(guess.medianHomeValue)}{getResult(guess.medianHomeValue, "medianHomeValue", targetCity.medianHomeValue)}</motion.td>
                  <motion.td variants={rowVariants}>{guess.lat}{getResult(guess.lat, "lat", targetCity.maxLat)}</motion.td>
                  <motion.td variants={rowVariants}>{guess.lng}{getResult(guess.lng, "lng", targetCity.maxLong)}</motion.td>
                </motion.tr>
              ))}
            </table>
            {Array
              .from({ length: MAX_GUESSES - guesses.length })
              .map((_, i) => (
                <div key={i} className="flex flex-row space-x-4 h-20 bg-slate-800 justify-center items-center w-full border-t-2 border-dashed border-white font-bold text-xl">
                  {guesses.length + i + 1}
                </div>
              ))}
            <BottomButtons />
          </div>
        </div>

        <div className="z-10">
          <div className="ring-8 relative flex flex-col h-full items-center rounded-lg bg-slate-800 shadow-lg">
            <div className="p-8 pb-0 drop-shadow-lg">
              <MyMapGeoJson
                setHoveredCity={setHoveredCity}
                targetCity={targetCity.name}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                guessedCities={guessedCities}
                coords={coords}
                setCoords={setCoords}
              />
            </div>
            <div className="font-bold text-xl pt-4 pb-14">{hoveredCity ?? "Choose a city"}</div>
            <form
              className="pb-4 absolute -bottom-12 z-20"
              action={async () => await onSubmit()}
            >
              <SubmitButton selectedCity={selectedCity} />
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}