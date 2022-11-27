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

const LayerInfo: { [key in Layer]: LayerInfo } = {
  [Layer.DIRT]: LayersJSON[Layer.DIRT],
  [Layer.STONE]: LayersJSON[Layer.STONE],
  [Layer.DEEPSLATE]: LayersJSON[Layer.DEEPSLATE],
  [Layer.NETHEROCK]: LayersJSON[Layer.NETHEROCK],
  [Layer.NETHER]: LayersJSON[Layer.NETHER],
  [Layer.BEDROCK]: LayersJSON[Layer.BEDROCK],
  [Layer.END]: LayersJSON[Layer.END],
};

export class TerrainGenerator {
  private _noiseGenerator: NoiseGenerator;

  constructor() {
    this._noiseGenerator = new NoiseGenerator({ seed: SEED });
  }

  getGroundTileAtCoords(coords: Vector2): TileType {
    const layersHeight = this.#getLayersElevation(coords.x);

    const layer = Object.entries(layersHeight).find(([_, height]) => {
      return coords.y <= height;
    });

    if (!layer) return TileType.NONE;

    return this.#getTileAtLayer(layer[0] as Layer);
  }

  #getLayersElevation(x: number) {
    const layersHeight: { [key in Layer]?: number } = {
      [Layer.DIRT]: 0,
      [Layer.STONE]: 0,
      [Layer.DEEPSLATE]: 0,
      [Layer.NETHEROCK]: 0,
      [Layer.NETHER]: 0,
      [Layer.BEDROCK]: 0,
      [Layer.END]: 0,
    };

    for (const [layer, info] of Object.entries(LayerInfo)) {
      const noise = this._noiseGenerator.getNoiseAtPoint(x, info.waves);
      layersHeight[layer as Layer] = info.baseHeight + noise;
    }
    console.log(layersHeight);

    return layersHeight;
  }

  #getTileAtLayer(layer: Layer): TileType {
    switch (layer) {
      case Layer.DIRT:
        return TileType.DIRT;
      case Layer.STONE:
        return TileType.STONE;
      case Layer.DEEPSLATE:
        return TileType.STONE;
      case Layer.NETHEROCK:
        return TileType.STONE;
      case Layer.NETHER:
        return TileType.STONE;
      case Layer.BEDROCK:
        return TileType.STONE;
      case Layer.END:
        return TileType.STONE;

      default:
        return TileType.NONE;
    }
  }
}
