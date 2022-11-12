import p5 from 'p5';
import Vector2 from '@util/Vector2';
import { TileType } from '@game/constant/constants';
const p5Instance = new p5(() => {});

const DISPL = 100000;

const roundToDecimals = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

const TERRAIN_VARIANCE = 5;
const TERRAIN_SMOOTHNESS = 0.05;
const MOUNTAIN_VARIANCE = 100;
const MOUNTAIN_SMOOTHNESS = 0.005;

export const getTerrainElevation = (seed: number, x: number) => {
  p5Instance.noiseSeed(seed);

  const terrainNoise = Math.round((p5Instance.noise((x + DISPL) * TERRAIN_SMOOTHNESS) - 0.5) * TERRAIN_VARIANCE);
  const mountainNoise = Math.round((p5Instance.noise((x + DISPL) * MOUNTAIN_SMOOTHNESS) - 0.5) * MOUNTAIN_VARIANCE);
  return terrainNoise + mountainNoise;
};

export const addNoiseToTerrain = (
  seed: number,
  x: number,
  smoothness = TERRAIN_SMOOTHNESS,
  variance = TERRAIN_VARIANCE
) => {
  p5Instance.noiseSeed(seed);

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

export const hasOre = (seed: number, oreType: TileType, coords: Vector2) => {
  const oreInfo = ores[oreType];
  if (!oreInfo) return false;

  const { i, depositSize, frequency } = oreInfo;
  p5Instance.noiseSeed(seed + i);

  return (
    roundToDecimals(p5Instance.noise((coords.x + DISPL) * frequency, (coords.y + DISPL) * frequency), 2) >
    1 - depositSize
  );
};
