export type MemeResult = {
  id: string
  name: string
  image: string
  description: string
}

export type Position = {
  x: number
  y: number
}

export type MemeTextLayer = {
  id: string
  text: string
  fontSize: number
  position: Position
}

export type MemeImageLayer = {
  id: string
  src: string
  position: Position
  width: number
  height: number
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}
