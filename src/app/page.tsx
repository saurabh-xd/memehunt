"use client";
import { Image as ImageIcon } from "lucide-react";
import Header from "@/components/landing/Header";
import MemeSearch from "@/components/landing/MemeSearch";
import { useMemeGenerator } from "@/hooks/useMemeGenerator";
import MemeEditor from "@/components/landing/meme-editor";

export default function Home() {
  const { situation, setSituation, template, isLoading, error, generate } =
    useMemeGenerator(); //for api call

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

      {/* Meme Result */}
      {template && <MemeEditor templateImage={template.image} />}

      {/* Empty State */}
      {!template && !isLoading && !error && (
        <div className="mt-16 flex flex-col items-center text-muted-foreground opacity-40">
          <ImageIcon className="w-16 h-16 mb-4" />
          <p>Your generated meme will appear here</p>
        </div>
      )}
    </main>
  );
}
