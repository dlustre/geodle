'use client';

import { useState } from "react";
import { MyMap } from "~/components/MyMap";
import { getCityFromCoords } from "./server-actions";

interface Guess {
  name: string;
  lat: number;
  lng: number;
}

const testData = (Array
  .from({ length: 10 })
  .fill({
    name: "UC Irvine",
    lat: 33.6405,
    lng: -117.8443,
  } satisfies Guess) as Guess[])
  .map((guess: Guess, i) => (
    <div key={i} className="flex flex-row">
      <div>{guess.name}</div>
      <div>{guess.lat}</div>
      <div>{guess.lng}</div>
    </div>
  ));

const ucirvine_coords: [number, number] = [33.6405, -117.8443];

export default function HomePage() {
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [marker, setMarker] = useState<[number, number]>(ucirvine_coords);
  getCityFromCoords("33.6405", "-117.8443").then((data) => {
    console.log(data);
  }).catch((err) => {
    console.error(err);
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        {guesses.map((guess: Guess, i) => (
          <div key={i} className="flex flex-row space-x-4 p-4 bg-slate-800 rounded-md border-4 border-white">
            <div>{guess.name}</div>
            <div>{guess.lat}{guess.lat === ucirvine_coords[0] ? "Equal" : guess.lat > ucirvine_coords[0] ? "Greater" : "Less"}</div>
            <div>{guess.lng}{guess.lng === ucirvine_coords[1] ? "Equal" : guess.lng > ucirvine_coords[1] ? "Greater" : "Less"}</div>
          </div>
        ))}
        <MyMap
          marker={marker}
          setMarker={setMarker}
        />
        <form>
          <button
            className="bg-white text-black p-4 rounded-lg"
            onClick={() => {
              setGuesses((oldGuesses) => [
                ...oldGuesses,
                {
                  name: "UC Irvine",
                  lat: marker[0],
                  lng: marker[1],
                },
              ]);
            }}
          >
            Confirm
          </button>
        </form>
      </div>
    </main>
  );
}
