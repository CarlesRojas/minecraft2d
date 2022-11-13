import Vector2 from '@util/Vector2';
import { addNoiseToTerrain, getTerrainElevation, hasOre } from '@game/tools/Noise';
import { TileType } from '@game/tools/Textures';

const tileTypeCache: { [key: string]: TileType } = {};

export const getTileTypeInCoords = async (seed: number, coords: Vector2) => {
  const { x, y } = coords;
  const key = coords.toString();

  if (tileTypeCache[key]) return tileTypeCache[key];

  const elevation = getTerrainElevation(seed, x);
  const stoneElevation = elevation + 1 + addNoiseToTerrain(seed, x, 0.1);

  let tileType = TileType.NONE;

  if (y === elevation) tileType = TileType.GRASS;
  else if (y > stoneElevation) {
    if (hasOre(seed, TileType.ANDESITE, coords)) tileType = TileType.ANDESITE;
    else if (hasOre(seed, TileType.DIORITE, coords)) tileType = TileType.DIORITE;
    else if (hasOre(seed, TileType.GRANITE, coords)) tileType = TileType.GRANITE;
    else if (hasOre(seed, TileType.COAL, coords)) tileType = TileType.COAL;
    else if (hasOre(seed, TileType.IRON, coords)) tileType = TileType.IRON;
    else if (hasOre(seed, TileType.DIAMOND, coords)) tileType = TileType.DIAMOND;
    else tileType = TileType.STONE;
  } else if (y > elevation) tileType = TileType.DIRT;

  tileTypeCache[key] = tileType;
  return tileType;
};
