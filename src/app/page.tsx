"use client";
import { useRef, useState } from "react";
import Header from "@/components/landing/Header";
import MemeSearch from "@/components/landing/MemeSearch";
import { useMemeGenerator } from "@/hooks/useMemeGenerator";
import MemeEditor from "@/components/landing/meme-editor";
import { useSession } from "@/lib/auth-client";
import { useGuestUsage } from "@/hooks/useGuestUsage";

import Templates from "@/components/landing/Templates";
import SignInDialog from "@/components/signInDialog";
import { useActiveTemplate } from "@/context/ActiveTemplateContext";
import {
  GENERATION_DIALOG_COPY,
  WATERMARK_DIALOG_COPY,
} from "@/constants/dialog-copy";

export default function Home() {
  const { data: session } = useSession();
  const { incrementUsage, isLimitReached, limit } = useGuestUsage();
  const { situation, setSituation, isLoading, error, generate, clearTemplate } =
    useMemeGenerator(); 
  const {
    activeTemplateImage,
    hasActiveTemplate,
    selectCustomTemplate,
    selectGeneratedTemplate,
    clearActiveTemplate,
  } = useActiveTemplate();

  const editorRef = useRef<HTMLDivElement | null>(null);

  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [signInDialogCopy, setSignInDialogCopy] = useState(GENERATION_DIALOG_COPY);

  function handleCustomTemplateSelect(file: File) {
    const imageUrl = URL.createObjectURL(file);
    clearTemplate();
    selectCustomTemplate(imageUrl, file.name);
  }

  function openWatermarkSignInDialog() {
    setSignInDialogCopy(WATERMARK_DIALOG_COPY)
    setShowSignInDialog(true)
  }

  function scrollToEditor() {
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleGenerate(e?: React.FormEvent) {
    if (!session?.user && isLimitReached) {
      if (e) e.preventDefault();
      setSignInDialogCopy({
        title: GENERATION_DIALOG_COPY.title,
        description: `You have used all ${limit} free AI generations. Sign in with Google to continue creating memes.`,
      })
      setShowSignInDialog(true);
      return;
    }

    clearActiveTemplate();
    const generatedTemplate = await generate(e);

    if (!generatedTemplate) {
      return;
    }

    selectGeneratedTemplate(generatedTemplate);

    if (!session?.user) {
      incrementUsage();
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center pt-6 px-6 gap-8">
      <Header />

      <MemeSearch
        generate={handleGenerate}
        isLoading={isLoading}
        situation={situation}
        setSituation={setSituation}
      />

      <div ref={editorRef} className="w-full  flex justify-center ">
        <MemeEditor
          templateImage={activeTemplateImage}
          hasActiveTemplate={hasActiveTemplate}
          isSignedIn={Boolean(session?.user)}
          handleCustomTemplateSelect={handleCustomTemplateSelect}
          clearActiveTemplate={clearActiveTemplate}
          openWatermarkSignInDialog={openWatermarkSignInDialog}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 py-2 px-4 rounded-md">
          {error}
        </p>
      )}

      <SignInDialog
        showSignInDialog={showSignInDialog}
        setShowSignInDialog={setShowSignInDialog}
        limit={limit}
        title={signInDialogCopy.title}
        description={signInDialogCopy.description}
      />

      <Templates onTemplateSelect={scrollToEditor} />
    </main>
  );
}
