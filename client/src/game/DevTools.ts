import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { Event } from '@util/Events';

export interface DevToolsProps {
  global: Global;
}

export default class DevTools extends GameClass {
  global: Global;
  frameRate: number;

  constructor({ global }: DevToolsProps) {
    super();
    this.global = global;
    this.frameRate = 0;
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
    if (this.frameRate !== frameRate) {
      this.frameRate = frameRate;
      this.global.events.emit(Event.ON_FRAME_RATE_CHANGE, { frameRate: this.frameRate });
    }
  }
}
