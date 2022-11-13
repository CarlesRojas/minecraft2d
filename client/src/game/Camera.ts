import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { Event } from '@util/Events';

export interface CameraProps {
  global: Global;
}

export default class Camera extends GameClass {
  private _global: Global;

  constructor({ global }: CameraProps) {
    super();
    this._global = global;
  }

  destructor() {}

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {}

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {}
}
