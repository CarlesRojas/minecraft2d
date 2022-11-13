import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { Event } from '@util/Events';

export interface DevToolsProps {
  global: Global;
}

export default class DevTools extends GameClass {
  private _global: Global;
  private _frameRate: number;

  constructor({ global }: DevToolsProps) {
    super();
    this._global = global;
    this._frameRate = 0;
  }

  destructor() {}

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {}

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.#updateFrameRate(deltaInSeconds);
  }

  #updateFrameRate(deltaInSeconds: number) {
    const frameRate = Math.floor(1 / deltaInSeconds);
    if (this._frameRate !== frameRate) {
      this._frameRate = frameRate;
      this._global.events.emit(Event.ON_FRAME_RATE_CHANGE, { frameRate: this._frameRate });
    }
  }
}
