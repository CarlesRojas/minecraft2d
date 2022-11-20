import Vector2 from '@game/util/Vector2';

export interface CoordsMap<T> {
  [key: string]: T;
}

export interface TileMap<T> {
  tilemap: CoordsMap<T>;
  get elementAtCoords(): (coords: Vector2) => T | null;
}
