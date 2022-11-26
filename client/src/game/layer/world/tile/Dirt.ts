import { TileProps } from './Tile';
import TileObject from './TileObject';

export default class Dirt extends TileObject {
  // TODO grow grass
  // private _growGrassTimer: Timer;
  // private _growGrassSettings = { min: 5, max: 10 };

  constructor(tileProps: TileProps, handleBreak: () => void) {
    super(tileProps, handleBreak);

    // const growGrassTimerAmmout =
    //   random(true) * (this._growGrassSettings.max - this._growGrassSettings.min) + this._growGrassSettings.min;

    // this._growGrassTimer = new Timer(growGrassTimerAmmout, this.#growGrass.bind(this));
  }

  // #################################################
  //   MONO
  // #################################################

  gameLoop(deltaInSeconds: number) {
    super.gameLoop(deltaInSeconds);

    // if (this._type === TileType.DIRT) this._growGrassTimer.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   GROW GRASS
  // #################################################

  // #growGrass() {
  //   const texture = getTileTexture(TileType.GRASS);
  //   if (this._sprite) this._sprite.texture = texture;
  // }
}
