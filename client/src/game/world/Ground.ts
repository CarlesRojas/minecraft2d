import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';

export interface GroundProps {
  global: Global;
}

export default class Ground extends GameClass {
  global: Global;
  container: PIXI.Container;

  constructor({ global }: GroundProps) {
    super();
    this.global = global;

    this.container = new PIXI.Container();
    this.global.app.stage.addChild(this.container);
  }

  destructor() {
    this.global.app.stage.removeChild(this.container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {}

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {}
}
