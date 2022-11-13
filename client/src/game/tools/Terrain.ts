import Vector2 from '@util/Vector2';
import { addNoiseToTerrain, getTerrainElevation, hasOre, isCave } from '@game/tools/Noise';
import { TileType } from '@game/tools/Textures';

interface TileInfo {
  type: TileType;
  isCave: boolean;
}

const tileTypeCache: { [key: string]: TileInfo } = {};

export const getTileTypeInCoords = async (coords: Vector2) => {
  const { x, y } = coords;
  const key = coords.toString();

  if (tileTypeCache[key]) return tileTypeCache[key];

  const elevation = getTerrainElevation(x);
  const stoneElevation = elevation + 1 + addNoiseToTerrain(x, 0.1);

  let tileType = TileType.NONE;
  let cave = false;

  if (y === elevation) tileType = TileType.GRASS;
  else if (y > stoneElevation) {
    cave = isCave(coords);
    if (hasOre(TileType.ANDESITE, coords)) tileType = TileType.ANDESITE;
    else if (hasOre(TileType.DIORITE, coords)) tileType = TileType.DIORITE;
    else if (hasOre(TileType.GRANITE, coords)) tileType = TileType.GRANITE;
    else if (cave) tileType = TileType.STONE;
    else if (hasOre(TileType.COAL, coords)) tileType = TileType.COAL;
    else if (hasOre(TileType.IRON, coords)) tileType = TileType.IRON;
    else if (hasOre(TileType.DIAMOND, coords)) tileType = TileType.DIAMOND;
    else tileType = TileType.STONE;
  } else if (y > elevation) tileType = TileType.DIRT;

  tileTypeCache[key] = {
    type: tileType,
    isCave: cave,
  };

  return tileTypeCache[key];
};
