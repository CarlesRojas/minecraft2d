import { TileType } from '@game/system/Textures';
import Timer from '@game/util/Timer';
import Vector2 from '@game/util/Vector2';
import random from 'lodash/random';
import { TileProps } from './Tile';
import TileObject from './TileObject';

export default class Dirt extends TileObject {
  private _growGrassTimer: Timer;
  private _killGrassTimer: Timer;
  private _grassSettings = { min: 5, max: 20 };
  private _timersAreRunning = true;

  constructor(tileProps: TileProps, handleBreak: () => void) {
    super(tileProps, handleBreak);

    this._growGrassTimer = new Timer(1, () => this.setType(TileType.GRASS));
    this._killGrassTimer = new Timer(1, () => this.setType(TileType.DIRT));

    this.#resetGrassTimers();
  }

  // #################################################
  //   MONO
  // #################################################

  gameLoop(deltaInSeconds: number) {
    super.gameLoop(deltaInSeconds);

    const isCovered = this.#isCovered();

    if (this._type === TileType.DIRT && !isCovered) {
      this._growGrassTimer.gameLoop(deltaInSeconds);
      this._timersAreRunning = true;
    } else if (this._type === TileType.GRASS && isCovered) {
      this._killGrassTimer.gameLoop(deltaInSeconds);
      this._timersAreRunning = true;
    } else this.#resetGrassTimers();
  }

  // #################################################
  //   GROW GRASS
  // #################################################

  #isCovered() {
    const { x, y } = this._coords;

    let covered = false;
    if (this._isBackground)
      covered = this._global.controller.world.background.elementAtCoords(new Vector2(x, y - 1))?.occupied ?? false;
    else covered = this._global.controller.world.ground.elementAtCoords(new Vector2(x, y - 1))?.occupied ?? false;

    return covered ?? false;
  }

  #resetGrassTimers() {
    if (!this._timersAreRunning) return;

    const grassTimerAmmout =
      random(true) * (this._grassSettings.max - this._grassSettings.min) + this._grassSettings.min;

    this._growGrassTimer.reset(grassTimerAmmout);
    this._killGrassTimer.reset(grassTimerAmmout);

    this._timersAreRunning = false;
  }
}
