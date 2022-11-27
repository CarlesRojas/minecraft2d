import LayersJSON from '@asset/json/terrain/layers.json';
import { SEED } from '@game/constant/constants';
import Vector2 from '@game/util/Vector2';
import { NoiseGenerator, Wave } from './NoiseGenerator';
import { TileType } from './Textures';

enum Layer {
  DIRT = 'dirt',
  STONE = 'stone',
  DEEPSLATE = 'deepslate',
  NETHEROCK = 'netherock',
  NETHER = 'nether',
  BEDROCK = 'bedrock',
  END = 'end',
}

interface LayerInfo {
  baseHeight: number;
  waves: Wave[];
}

const Layers: { [key in Layer]: LayerInfo } = {
  [Layer.DIRT]: LayersJSON[Layer.DIRT],
  [Layer.STONE]: LayersJSON[Layer.STONE],
  [Layer.DEEPSLATE]: LayersJSON[Layer.DEEPSLATE],
  [Layer.NETHEROCK]: LayersJSON[Layer.NETHEROCK],
  [Layer.NETHER]: LayersJSON[Layer.NETHER],
  [Layer.BEDROCK]: LayersJSON[Layer.BEDROCK],
  [Layer.END]: LayersJSON[Layer.END],
};

const BIG_CAVE_SIZE = 0.37; // [0, 1] The bigger the number, the bigger the cave
const SMALL_CAVE_SIZE = 0.028; // [0, 1] The bigger the number, the bigger the cave

export class TerrainGenerator {
  private _noiseGenerator: NoiseGenerator;

  constructor() {
    this._noiseGenerator = new NoiseGenerator({ seed: SEED });
  }

  getGroundTileAtCoords(coords: Vector2): TileType {
    const layersHeight = this.#getLayersElevation(coords.x);

    // @ts-ignore
    const layer: [Layer, number] | undefined = Object.entries(layersHeight).findLast(([_, height]) => {
      return coords.y >= height;
    });

    if (!layer) return TileType.NONE;
    const isCave = this.#isCave(coords, layer[0]);

    if (![Layer.NETHEROCK, Layer.BEDROCK].includes(layer[0]) && isCave) return TileType.NONE;
    return this.#getTileAtLayer(layer[0], coords, layersHeight[Layer.DIRT]);
  }

  getBackgroundTileAtCoords(coords: Vector2): TileType {
    const layersHeight = this.#getLayersElevation(coords.x);

    if (coords.y >= layersHeight[Layer.DIRT]) return TileType.STONE;
    return TileType.NONE;
  }

  #getLayersElevation(x: number) {
    const layersHeight: { [key in Layer]: number } = {
      [Layer.DIRT]: 0,
      [Layer.STONE]: 0,
      [Layer.DEEPSLATE]: 0,
      [Layer.NETHEROCK]: 0,
      [Layer.NETHER]: 0,
      [Layer.BEDROCK]: 0,
      [Layer.END]: 0,
    };

    for (const [layer, info] of Object.entries(Layers)) {
      const noise = this._noiseGenerator.getNoiseAtPoint(x, info.waves);
      layersHeight[layer as Layer] = info.baseHeight + noise;
    }

    return layersHeight;
  }

  #isCave(coords: Vector2, layer: Layer) {
    const noCaveLayers = [Layer.DIRT, Layer.BEDROCK, Layer.NETHEROCK];
    const canHaveBigCave = !noCaveLayers.includes(layer);
    const offset = layer === Layer.NETHER ? 10000 : layer === Layer.END ? 20000 : 0;

    const isBigCaveNoise = this._noiseGenerator.getNoiseAtCoords(coords, [{ amplitude: 1, frequency: 0.03, offset }], {
      decimals: 2,
      aroundZero: false,
    });

    const smallCaveNoise = this._noiseGenerator.getNoiseAtCoords(coords, [{ amplitude: 1, frequency: 0.018, offset }], {
      decimals: 2,
      aroundZero: false,
    });

    const isBigCave = isBigCaveNoise > 1 - BIG_CAVE_SIZE;
    const isSmallCave = smallCaveNoise > 0.5 - SMALL_CAVE_SIZE && smallCaveNoise < 0.5 + SMALL_CAVE_SIZE;

    return (canHaveBigCave && isBigCave) || isSmallCave;
  }

  // TODO this should be modified by the biome
  #getTileAtLayer(layer: Layer, coords: Vector2, surfaceHeight: number): TileType {
    if (coords.y === surfaceHeight) return TileType.GRASS;

    switch (layer) {
      case Layer.DIRT:
        return TileType.DIRT;
      case Layer.STONE:
        return TileType.STONE;
      case Layer.DEEPSLATE:
        return TileType.DEEPSLATE;
      case Layer.NETHEROCK:
        return TileType.NETHEROCK;
      case Layer.NETHER:
        return TileType.NETHERRACK;
      case Layer.BEDROCK:
        return TileType.BEDROCK;
      case Layer.END:
        return TileType.END_STONE;

      default:
        return TileType.NONE;
    }
  }
}
