import Vector2 from '@util/Vector2';
import { SAFTY_TILES, TileType } from '@util/constant/constants';
import * as PIXI from 'pixi.js';
import { addNoiseToTerrain, getTerrainElevation, hasOre } from '@util/Noise';

import dirtImage from '@asset/textures/block/dirt.png';
import grassImage from '@asset/textures/block/grass_block_side.png';
import stoneImage from '@asset/textures/block/stone.png';
import coalImage from '@asset/textures/block/coal_ore.png';
import ironImage from '@asset/textures/block/iron_ore.png';
import diamondImage from '@asset/textures/block/diamond_ore.png';

export const getRenderedTiles = (tileSize: number, dimensions: { width: number; height: number }) => {
  if (tileSize === 0) return null;

  const horizontal = Math.ceil(dimensions.width / tileSize) + SAFTY_TILES;
  const vertical = Math.ceil(dimensions.height / tileSize) + SAFTY_TILES;
  const halfHorizontal = Math.floor(horizontal / 2);
  const halfVertical = Math.floor(vertical / 2);

  const grid: Vector2[] = [];
  for (let x = 0; x < horizontal; x++)
    for (let y = 0; y < vertical; y++) grid.push(new Vector2(x - halfHorizontal, y - halfVertical));

  return grid;
};

export const getTileTypeInCoords = (seed: number, coords: Vector2) => {
  const terrainHeight = getTerrainElevation(seed, coords.x);
  const stoneTerrainHeight = terrainHeight + 1 + addNoiseToTerrain(seed, coords.x, 0.1);

  if (coords.y === terrainHeight) return TileType.GRASS;
  if (coords.y > stoneTerrainHeight) {
    if (hasOre(seed, TileType.COAL, coords)) return TileType.COAL;
    if (hasOre(seed, TileType.IRON, coords)) return TileType.IRON;
    if (hasOre(seed, TileType.DIAMOND, coords)) return TileType.DIAMOND;
    return TileType.STONE;
  }
  if (coords.y > terrainHeight) return TileType.DIRT;

  return TileType.NONE;
};

export const getTextureFromTileType = (type: TileType) => {
  const getTexture = (type: TileType) => {
    switch (type) {
      case TileType.DIRT:
        return PIXI.Texture.from(dirtImage);
      case TileType.GRASS:
        return PIXI.Texture.from(grassImage);
      case TileType.STONE:
        return PIXI.Texture.from(stoneImage);
      case TileType.COAL:
        return PIXI.Texture.from(coalImage);
      case TileType.IRON:
        return PIXI.Texture.from(ironImage);
      case TileType.DIAMOND:
        return PIXI.Texture.from(diamondImage);
      default:
        return null;
    }
  };

  const texture = getTexture(type);
  if (!texture) return null;

  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return texture;
};
