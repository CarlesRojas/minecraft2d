import { Dimensions } from '@game/Controller';

export default abstract class Controller {
  constructor() {}
  abstract destructor(): void;
  abstract handleResize(dimensions: Dimensions): void;
  abstract gameLoop(deltaInSeconds: number): void;
}

/*

import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';

export interface WorldProps {
  global: Global;
}

export default class World extends GameClass {
  global: Global;
  container: PIXI.Container;

  constructor({ global }: WorldProps) {
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

*/
