import Vector2 from '@game/util/Vector2';
import P5 from 'p5';

export interface Wave {
  frequency: number; // How many waves per unit of length
  amplitude: number; // How high the wave is in tiles
  offset: number; // How far the wave is shifted in tiles
}

interface NoiseProps {
  seed: number;
}

interface NoiseOptions {
  round?: boolean;
  decimals?: number;
  aroundZero?: boolean;
}

const defaultOptions = {
  round: true,
  decimals: 0,
  aroundZero: true,
};

const roundToDecimals = (num: number, decimals: number) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

const DISPLACEMENT = 100000;

export class NoiseGenerator {
  private _p5Instance: P5;

  constructor({ seed }: NoiseProps) {
    this._p5Instance = new P5(() => {});
    this._p5Instance.noiseSeed(seed);
  }

  public getNoiseAtPoint(x: number, waves: Wave[], options?: NoiseOptions): number {
    const round = options?.round ?? defaultOptions.round;
    const aroundZero = options?.aroundZero ?? defaultOptions.aroundZero;
    const decimals = options?.decimals ?? defaultOptions.decimals;

    let noise = 0;

    for (const wave of waves) {
      const samplePos = x + wave.offset + DISPLACEMENT;
      noise += (this._p5Instance.noise(samplePos * wave.frequency) - (aroundZero ? 0.5 : 0)) * wave.amplitude;
    }

    return round ? roundToDecimals(noise, decimals) : noise;
  }

  public getNoiseAtCoords(coords: Vector2, waves: Wave[], options?: NoiseOptions): number {
    const round = options?.round ?? defaultOptions.round;
    const aroundZero = options?.aroundZero ?? defaultOptions.aroundZero;
    const decimals = options?.decimals ?? defaultOptions.decimals;

    const { x, y } = coords;
    let noise = 0;

    for (const wave of waves) {
      const samplePos = new Vector2(x + wave.offset + DISPLACEMENT, y + wave.offset + DISPLACEMENT);

      noise +=
        (this._p5Instance.noise(samplePos.x * wave.frequency, samplePos.y * wave.frequency) - (aroundZero ? 0.5 : 0)) *
        wave.amplitude;
    }

    return round ? roundToDecimals(noise, decimals) : noise;
  }
}
