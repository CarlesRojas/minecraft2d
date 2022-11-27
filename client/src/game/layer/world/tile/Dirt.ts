import { TileType } from '@game/system/Textures';
import Timer from '@game/util/Timer';
import Vector2 from '@game/util/Vector2';
import random from 'lodash/random';
import { TileProps } from './Tile';
import TileObject from './TileObject';

export default class Dirt extends TileObject {
  private _growGrassTimer: Timer;
  private _killGrassTimer: Timer;
  private _grassSettings = { min: 2, max: 10 };
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

    if (this._type === TileType.DIRT && !isCovered && this.#hasGrassAround()) {
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

    const tilemap = this._isBackground
      ? this._global.controller.world.background
      : this._global.controller.world.ground;

    const covered = tilemap.elementAtCoords(new Vector2(x, y - 1))?.occupied ?? false;

    return covered ?? false;
  }

  #hasGrassAround() {
    const { x, y } = this._coords;

    const coordsToCheck = [
      new Vector2(x - 1, y - 1),
      new Vector2(x - 1, y),
      new Vector2(x - 1, y + 1),
      new Vector2(x + 1, y - 1),
      new Vector2(x + 1, y),
      new Vector2(x + 1, y + 1),
    ];

    const tilemap = this._isBackground
      ? this._global.controller.world.background
      : this._global.controller.world.ground;

    for (const coords of coordsToCheck) {
      const type = tilemap.elementAtCoords(coords)?.type;
      if (type && type === TileType.GRASS) return true;
    }

    return false;
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
