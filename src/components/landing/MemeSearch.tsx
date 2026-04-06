import React from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type props = {
  generate: (e?: React.FormEvent) => void;
  isLoading: boolean;
  situation: string;
  setSituation: (v: string) => void;
};

export default function MemeSearch({
  generate,
  isLoading,
  situation,
  setSituation,
}: props) {
  return (
    <form
      onSubmit={generate}
      className="flex w-full max-w-[1050px] items-stretch gap-2"
    >
      <Input
        className="h-12 min-w-0 flex-1 rounded-xl text-xs sm:h-14 sm:text-lg"
        placeholder="When you fix one bug but create three more..."
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
      />

      <Button
        type="submit"
        disabled={isLoading || !situation.trim()}
        className="h-12 shrink-0 rounded-xl px-2.5 text-sm cursor-pointer bg-gradient-to-b from-blue-500 to-blue-500 text-white font-medium hover:opacity-80 transition-all duration-300 sm:h-14 sm:min-w-40 sm:px-6 sm:text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Matching...</span>
          </>
        ) : (
          <>
            <WandSparkles className="h-5 w-5" />
            <span>Get Meme</span>
          </>
        )}
      </Button>
    </form>
  );
}
