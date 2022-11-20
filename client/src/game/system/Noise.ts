import { SEED } from '@game/constant/constants';
import { TileType } from '@game/system/Textures';
import Vector2 from '@game/util/Vector2';
import p5 from 'p5';
const p5Instance = new p5(() => {});
p5Instance.noiseSeed(SEED);

const DISPL = 100000;

const roundToDecimals = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

const TERRAIN_VARIANCE = 5;
const TERRAIN_SMOOTHNESS = 0.05;
const MOUNTAIN_VARIANCE = 100;
const MOUNTAIN_SMOOTHNESS = 0.005;

const terrainElevationCache: { [key: number]: number } = {};

export const getTerrainElevation = (x: number) => {
  if (terrainElevationCache[x]) return terrainElevationCache[x];

  const terrainNoise = Math.round((p5Instance.noise((x + DISPL) * TERRAIN_SMOOTHNESS) - 0.5) * TERRAIN_VARIANCE);
  const mountainNoise = Math.round((p5Instance.noise((x + DISPL) * MOUNTAIN_SMOOTHNESS) - 0.5) * MOUNTAIN_VARIANCE);

  terrainElevationCache[x] = terrainNoise + mountainNoise;
  return terrainElevationCache[x];
};

export const addNoiseToTerrain = (x: number, smoothness = TERRAIN_SMOOTHNESS, variance = TERRAIN_VARIANCE) => {
  return Math.round(p5Instance.noise((x + DISPL) * smoothness) * variance);
};

interface OreInfo {
  i: number;
  depositSize: number; // (0-1) Size of the deposit, the closer to 1 the bigger the deposit
  frequency: number; // (0-1) Rarity of the deposit, the closer to 1 the more common the deposit
}

const ores: { [key in TileType]?: OreInfo } = {
  [TileType.COAL]: { i: 0, depositSize: 0.36, frequency: 0.3 },
  [TileType.IRON]: { i: 1, depositSize: 0.3, frequency: 0.2 },
  [TileType.DIAMOND]: { i: 2, depositSize: 0.26, frequency: 0.15 },
  [TileType.ANDESITE]: { i: 3, depositSize: 0.3, frequency: 0.07 },
  [TileType.DIORITE]: { i: 4, depositSize: 0.3, frequency: 0.07 },
  [TileType.GRANITE]: { i: 5, depositSize: 0.3, frequency: 0.07 },
};

export const hasOre = (oreType: TileType, coords: Vector2) => {
  const oreInfo = ores[oreType];
  if (!oreInfo) return false;

  const { i, depositSize, frequency } = oreInfo;

  return (
    roundToDecimals(p5Instance.noise((coords.x + DISPL) * frequency, (coords.y + DISPL) * frequency), 2) >
    1 - depositSize
  );
};

export const isCave = (coords: Vector2, stoneElevation: number) => {
  const isBelowStoneElevation = coords.y > stoneElevation;

  const bigCaveSize = 0.37;
  const bigCaveFrequency = 0.03;

  const isBigCave =
    isBelowStoneElevation &&
    roundToDecimals(p5Instance.noise((coords.x + DISPL) * bigCaveFrequency, (coords.y + DISPL) * bigCaveFrequency), 2) >
      1 - bigCaveSize;

  const smallCaveSize = 0.028;
  const smallCaveFrequency = 0.009;

  const smallCaveNoise = roundToDecimals(
    p5Instance.noise((coords.x + DISPL) * smallCaveFrequency * 2, (coords.y + DISPL) * smallCaveFrequency * 2),
    2
  );

  const isSmallCave = smallCaveNoise > 0.5 - smallCaveSize && smallCaveNoise < 0.5 + smallCaveSize;

  return isBigCave || isSmallCave;
};
