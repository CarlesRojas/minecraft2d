import Vector2 from '@util/Vector2';
import { addNoiseToTerrain, getTerrainElevation, hasOre } from '@game/tools/Noise';
import { TileType } from '@game/tools/Textures';

const elevationCache: { [key: number]: number } = {};

export const getTileTypeInCoords = async (seed: number, coords: Vector2) => {
  const { x, y } = coords;

  if (!elevationCache[x]) elevationCache[x] = getTerrainElevation(seed, x);

  const terrainHeight = elevationCache[x];
  const stoneTerrainHeight = terrainHeight + 1 + addNoiseToTerrain(seed, x, 0.1);

  if (y === terrainHeight) return TileType.GRASS;
  if (y > stoneTerrainHeight) {
    if (hasOre(seed, TileType.ANDESITE, coords)) return TileType.ANDESITE;
    if (hasOre(seed, TileType.DIORITE, coords)) return TileType.DIORITE;
    if (hasOre(seed, TileType.GRANITE, coords)) return TileType.GRANITE;
    if (hasOre(seed, TileType.COAL, coords)) return TileType.COAL;
    if (hasOre(seed, TileType.IRON, coords)) return TileType.IRON;
    if (hasOre(seed, TileType.DIAMOND, coords)) return TileType.DIAMOND;
    return TileType.STONE;
  }
  if (y > terrainHeight) return TileType.DIRT;

  return TileType.NONE;
};
