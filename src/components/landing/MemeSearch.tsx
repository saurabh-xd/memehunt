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
    <form onSubmit={generate} className="flex w-full max-w-[1050px] gap-2">
      <Input
        className="h-14 text-lg rounded-xl  flex-1"
        placeholder="When you fix one bug but create three more..."
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
      />

      <Button
        type="submit"
        disabled={isLoading || !situation.trim()}
        className="h-14 px-6 rounded-xl text-lg cursor-pointer text-lg"
      >
        
        {isLoading ?
        <Loader2 className="animate-spin w-5 h-5" />
        : <><WandSparkles />   <span>Get Meme </span></> }
      </Button>
    </form>
  );
}
