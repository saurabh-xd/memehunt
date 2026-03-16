"use client";
import { ChangeEvent, useEffect, useId, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import Header from "@/components/landing/Header";
import MemeSearch from "@/components/landing/MemeSearch";
import { useMemeGenerator } from "@/hooks/useMemeGenerator";
import MemeEditor from "@/components/landing/meme-editor";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { situation, setSituation, template, isLoading, error, generate } =
    useMemeGenerator(); //for api call
  const uploadId = useId();
  const [customTemplateImage, setCustomTemplateImage] = useState<string | null>(
    null
  );
  const [customTemplateName, setCustomTemplateName] = useState<string | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (customTemplateImage) {
        URL.revokeObjectURL(customTemplateImage);
      }
    };
  }, [customTemplateImage]);

  function handleCustomTemplateChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (customTemplateImage) {
      URL.revokeObjectURL(customTemplateImage);
    }

    const imageUrl = URL.createObjectURL(file);
    setCustomTemplateImage(imageUrl);
    setCustomTemplateName(file.name);
    event.target.value = "";
  }

  function clearCustomTemplate() {
    if (customTemplateImage) {
      URL.revokeObjectURL(customTemplateImage);
    }

    setCustomTemplateImage(null);
    setCustomTemplateName(null);
  }

  const activeTemplateImage = customTemplateImage ?? template?.image ?? null;

  return (
    <main className="min-h-screen bg-background flex flex-col items-center pt-8 px-6 gap-10">
      <Header />

      <MemeSearch
        generate={generate}
        isLoading={isLoading}
        situation={situation}
        setSituation={setSituation}
      />

      <div className="flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card/60 p-5 text-center">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Use your own image</h2>
          <p className="text-sm text-muted-foreground">
            Upload a local image or template and edit it just like generated
            memes.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <input
            id={uploadId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomTemplateChange}
          />
          <Button type="button" asChild className="cursor-pointer rounded-xl">
            <label htmlFor={uploadId}>Upload Custom Image</label>
          </Button>
          {customTemplateImage && (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={clearCustomTemplate}
            >
              Remove Custom Image
            </Button>
          )}
        </div>

        {customTemplateName && (
          <p className="text-sm text-muted-foreground">
            Selected: {customTemplateName}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 py-2 px-4 rounded-md">
          {error}
        </p>
      )}

      {/* Meme Result */}
      {activeTemplateImage && <MemeEditor templateImage={activeTemplateImage} />}

      {/* Empty State */}
      {!activeTemplateImage && !isLoading && !error && (
        <div className="mt-16 flex flex-col items-center text-muted-foreground opacity-40">
          <ImageIcon className="w-16 h-16 mb-4" />
          <p>Your generated meme will appear here</p>
        </div>
      )}
    </main>
  );
}
