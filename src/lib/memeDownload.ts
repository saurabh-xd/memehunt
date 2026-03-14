type DownloadOptions = {
  stage: import("konva/lib/Stage").Stage
  pixelRatio?: number
}

export function downloadMeme({
  stage,
  pixelRatio = 1
}: DownloadOptions) {
  const link = document.createElement("a")
  link.download = "meme.png"
  link.href = stage.toDataURL({ pixelRatio })
  link.click()
}
