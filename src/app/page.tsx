"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2,  Image as ImageIcon } from "lucide-react";

type MemeResult = {
  id: string
  name: string
  image: string
  description: string
}

export default function Home() {
  const [situation, setSituation] = useState("");
  const [template, setTemplate] = useState<MemeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");

  async function generate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!situation.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ situation }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate meme.");
        return;
      }

      setTemplate(data);
      setTopText(data.topText ?? "");
      setBottomText(data.bottomText ?? "");
    } catch (error) {
      console.error("Error generating meme:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const downloadMeme = async () => {
  if (!template) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = template.image;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // draw image
    ctx?.drawImage(img, 0, 0);

    // text style
    ctx!.fillStyle = "white";
    ctx!.strokeStyle = "black";
    ctx!.lineWidth = 4;
    ctx!.textAlign = "center";
    ctx!.font = "bold 48px Impact";

    // top text
    ctx!.strokeText(topText.toUpperCase(), canvas.width / 2, 60);
    ctx!.fillText(topText.toUpperCase(), canvas.width / 2, 60);

    // bottom text
    ctx!.strokeText(
      bottomText.toUpperCase(),
      canvas.width / 2,
      canvas.height - 30
    );
    ctx!.fillText(
      bottomText.toUpperCase(),
      canvas.width / 2,
      canvas.height - 30
    );

    // convert to downloadable image
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL();
    link.click();
  };
};

  // Authentic classic meme text styling
  const memeTextStyle = {
    WebkitTextStroke: "1px black",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center pt-8  px-6 gap-10">
      
      {/* Header Section */}
      <div className="flex flex-col items-center gap-3 text-center">
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          AI Meme Finder
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Describe any situation and let AI find and caption the perfect meme.
        </p>
      </div>

      {/* Search Form */}
      <form 
        onSubmit={generate}
        className="flex w-full max-w-2xl gap-2"
      >
        <Input
          className="h-14 text-lg rounded-xl focus-visible:ring-primary shadow-sm"
          placeholder="e.g., When you fix one bug but create three more..."
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !situation.trim()} 
          className="h-14 px-8 rounded-xl font-medium text-lg shadow-sm transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            "Generate"
          )}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 py-2 px-4 rounded-md font-medium">
          {error}
        </p>
      )}

      {/* Meme Result Section */}
      {template && (
        <div className="w-full max-w-5xl mt-4 grid md:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Meme Preview */}
          <div className="relative w-full  h-[350px] border shadow-sm rounded-md overflow-hidden bg-muted/30 flex items-center justify-center">
            <img 
              src={template.image} 
              alt={template.name} 
              className="max-w-full max-h-full object-contain" 
            />

            {/* Top Text */}
            <p 
              className="absolute top-6 w-[90%] text-center text-white font-black text-3xl md:text-4xl uppercase leading-tight"
              style={memeTextStyle}
            >
              {topText}
            </p>

            {/* Bottom Text */}
            <p 
              className="absolute bottom-6 w-[90%] text-center text-white font-black text-3xl md:text-4xl uppercase leading-tight"
              style={memeTextStyle}
            >
              {bottomText}
            </p>
          </div>

          {/* Edit Controls */}
          <div className="flex flex-col gap-6 p-6 border rounded-md shadow-sm bg-card">
            <div>
              <h3 className="text-lg font-semibold mb-1">Edit Caption</h3>
              <p className="text-sm text-muted-foreground mb-4">Adjust the AI's suggestion to perfection.</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Top Text</label>
                  <Input
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bottom Text</label>
                  <Input
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

             <div className="flex items-center justify-center mt-4">
              <Button className="rounded-lg w-full" onClick={downloadMeme}>Download</Button>
             </div>

            </div>

           
          </div>
        </div>
      )}
      
      {/* Empty State / Initial Load */}
      {!template && !isLoading && !error && (
        <div className="mt-16 flex flex-col items-center justify-center text-muted-foreground opacity-40">
          <ImageIcon className="w-16 h-16 mb-4" />
          <p>Your generated meme will appear here</p>
        </div>
      )}
    </main>
  );
}