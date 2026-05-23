import { MemeResult } from "@/types/meme";

export type MemeGenerateRequest = {
  situation: string;
};

export type MemeApiErrorResponse = {
  error: string;
};

export type MemeGenerateResponse = MemeResult;
export type MemeTemplatesResponse = {
  items: MemeResult[];
  nextOffset: number | null;
  total: number;
};
