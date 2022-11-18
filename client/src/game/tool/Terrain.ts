import { addNoiseToTerrain, getTerrainElevation, hasOre, isCave } from '@game/tool/Noise';
import { TileType } from '@game/tool/Textures';
import Vector2 from '@util/Vector2';

interface TileInfo {
  groundType: TileType;
  backgroundType: TileType;
  isCave: boolean;
  isSurface: boolean;
}

const tileTypeCache: { [key: string]: TileInfo } = {};

export const getTileTypeInCoords = async (coords: Vector2) => {
  const { x, y } = coords;
  const key = coords.toString();

  if (tileTypeCache[key]) return tileTypeCache[key];

  const elevation = getTerrainElevation(x);
  const stoneElevation = elevation + 1 + addNoiseToTerrain(x, 0.1);

  let backgroundTileType = TileType.NONE;
  let groundTileType = TileType.NONE;
  let cave = isCave(coords, stoneElevation);

  if (y === elevation) backgroundTileType = groundTileType = TileType.GRASS;
  else if (y > stoneElevation) {
    if (hasOre(TileType.ANDESITE, coords)) backgroundTileType = groundTileType = TileType.ANDESITE;
    else if (hasOre(TileType.DIORITE, coords)) backgroundTileType = groundTileType = TileType.DIORITE;
    else if (hasOre(TileType.GRANITE, coords)) backgroundTileType = groundTileType = TileType.GRANITE;
    else if (cave) backgroundTileType = groundTileType = TileType.STONE;
    else if (hasOre(TileType.COAL, coords)) backgroundTileType = groundTileType = TileType.COAL;
    else if (hasOre(TileType.IRON, coords)) backgroundTileType = groundTileType = TileType.IRON;
    else if (hasOre(TileType.DIAMOND, coords)) backgroundTileType = groundTileType = TileType.DIAMOND;
    else backgroundTileType = groundTileType = TileType.STONE;
  } else if (y > elevation) backgroundTileType = groundTileType = TileType.DIRT;

  tileTypeCache[key] = {
    groundType: backgroundTileType,
    backgroundType: backgroundTileType,
    isCave: cave,
    isSurface: y === elevation,
  };

  return tileTypeCache[key];
};
