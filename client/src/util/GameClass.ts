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
  _global: Global;
  _container: PIXI.Container;

  constructor({ global }: WorldProps) {
    super();
    this._global = global;

    this._container = new PIXI.Container();
    this._global.app.stage.addChild(this._container);
  }

  destructor() {
    this._global.app.stage.removeChild(this._container);
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
