import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@game/interface/Mono';
import Vector2 from '@game/util/Vector2';
import { Event } from '@util/Events';

interface DevToolsProps {
  global: Global;
}

export default class DevTools implements Mono {
  private _global: Global;
  private _frameRate: number;

  constructor({ global }: DevToolsProps) {
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
    this.#updateMousePosition();
  }

  #updateFrameRate(deltaInSeconds: number) {
    const frameRate = Math.floor(1 / deltaInSeconds);
    if (this._frameRate !== frameRate) {
      this._frameRate = frameRate;
      this._global.events.emit(Event.ON_FRAME_RATE_CHANGE, { frameRate: this._frameRate });
    }
  }

  #updateMousePosition() {
    const mousePosition = this._global.controller.interaction.mousePositionInTiles;
    this._global.events.emit(Event.ON_MOUSE_POSITION_CHANGE, { mouseCoords: mousePosition ?? new Vector2(0, 0) });
  }
}
