import * as PIXI from 'pixi.js';

import { Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import Vector2 from '@util/Vector2';
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

  handleResize(dimensions: Vector2) {}

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    const frameRate = Math.floor(1 / deltaInSeconds);
    if (this.frameRate !== frameRate) {
      this.frameRate = frameRate;
      this.global.events.emit(Event.ON_FRAME_RATE_CHANGE, { frameRate: this.frameRate });
    }
  }
}
