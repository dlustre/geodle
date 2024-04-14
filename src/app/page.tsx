'use client';

import { FormEvent, useState } from "react";
import { MyMap } from "~/components/MyMap";
import { getGeoInfoFromCoords } from "./server-actions";

const MAX_GUESSES = 5;

interface Guess {
  city: string;
  lat: number;
  lng: number;
}

const ucirvine_coords: [number, number] = [33.6405, -117.8443];

const orange_county_cities = [
  "Aliso Viejo",
  "Anaheim",
  "Brea",
  "Buena Park",
  "Costa Mesa",
  "Cypress",
  "Dana Point",
  "Fountain Valley",
  "Fullerton",
  "Garden Grove",
  "Huntington Beach",
  "Irvine",
  "La Habra",
  "La Palma",
  "Laguna Beach",
  "Laguna Hills",
  "Laguna Niguel",
  "Laguna Woods",
  "Lake Forest",
  "Los Alamitos",
  "Mission Viejo",
  "Newport Beach",
  "Orange",
  "Placentia",
  "Rancho Santa Margarita",
  "San Clemente",
  "San Juan Capistrano",
  "Santa Ana",
  "Seal Beach",
  "Stanton",
  "Tustin",
  "Villa Park",
  "Westminster",
  "Yorba Linda",
] as const;

function randomCity() {
  return orange_county_cities[Math.floor(Math.random() * orange_county_cities.length)];
}


export default function HomePage() {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number]>(ucirvine_coords);
  const [targetCity, setTargetCity] = useState(randomCity());
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");

  function GameEndModal() {
    return (
      <div className="size-full bg-black bg-opacity-20 flex flex-col items-center justify-center">
        <div>Game Over</div>
        <button
          onClick={() => {
            setMarker(null);
            setCenter(ucirvine_coords);
            setGuesses([]);
            setTargetCity(randomCity());
            setGameState("playing");
          }}
        >
          Play Again
        </button>
      </div>
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!marker) return;
    event.preventDefault();
    const guessInfo = await getGeoInfoFromCoords(marker[0].toString(), marker[1].toString());

    if (!guessInfo) return;

    const guess = {
      city: guessInfo.City,
      lat: Number(guessInfo.Latitude),
      lng: Number(guessInfo.Longitude),
    } satisfies Guess;
    setGuesses((oldGuesses) => [
      ...oldGuesses,
      guess,
    ]);

    if (guess.city === targetCity) {
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
          {`dev: city: ${targetCity}`}
          {gameState !== "playing" && <GameEndModal />}
          <div className="flex flex-col items-center justify-center bg-slate-800 rounded-md border-4 border-white">
            <div className="flex flex-row space-x-4 p-4 bg-slate-800 justify-between w-full px-4">
              <div>City</div>
              <div>Latitude</div>
              <div>Longitude</div>
            </div>
            {guesses.map((guess: Guess, i) => (
              <div key={i} className="flex flex-row space-x-4 p-4 bg-slate-800 justify-between w-full border-t-2 border-dashed border-white">
                <div>{guess.city}</div>
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
          <MyMap
            marker={marker}
            setMarker={setMarker}
            center={center}
            setCenter={setCenter}
          />
          {marker && <form onSubmit={onSubmit}>
            <button
              type="submit"
              className="bg-white text-black p-4 rounded-2xl font-bold"
            >
              Confirm
            </button>
          </form>}
        </div>
      </div>
    </main>
  );
}