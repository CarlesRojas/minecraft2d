import Vector2 from '@game/util/Vector2';
import P5 from 'p5';

export interface Wave {
  speed: number;
  frequency: number;
  amplitude: number;
}

interface NoiseProps {
  seed: number;
  waves: Wave[];
  offset: Vector2;
  scale: number;
}

export class NoiseGenerator {
  private _seed: number;
  private _waves: Wave[];
  private _offset: Vector2;
  private _scale: number;
  private _p5Instance: P5;

  constructor({ seed, waves, offset, scale }: NoiseProps) {
    this._seed = seed;
    this._waves = waves;
    this._offset = offset;
    this._scale = scale;

    this._p5Instance = new P5(() => {});
    this._p5Instance.noiseSeed(seed);
  }

  public getNoiseAtCoords(coords: Vector2): number {
    const { x, y } = coords;

    const samplePos = new Vector2(x * this._scale + this._offset.x, y * this._scale + this._offset.y);

    let normalization = 0;
    let noise = 0;

    for (const wave of this._waves) {
      noise += this._p5Instance.noise(samplePos.x * wave.frequency, samplePos.y * wave.frequency) * wave.amplitude;
      normalization += wave.amplitude;
    }

    return noise / normalization;
  }
}
