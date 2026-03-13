"use client";

import Header from "@/components/landing/Header";
import MemeSearch from "@/components/landing/MemeSearch";
import { useMemeGenerator } from "@/hooks/useMemeGenerator";


export default function Home() {
  const { situation, setSituation,  isLoading, error, generate } =
    useMemeGenerator();    //for api call

  return (
    <main className="min-h-screen bg-background flex flex-col items-center pt-8 px-6 gap-10">
      <Header />

      <MemeSearch
        generate={generate}
        isLoading={isLoading}
        situation={situation}
        setSituation={setSituation}
      />

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 py-2 px-4 rounded-md">
          {error}
        </p>
      )}

    
    </main>
  );
}
