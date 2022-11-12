import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import Ground from '@game/world/Ground';

export interface Layers {
  ground: Ground;
}

export interface WorldProps {
  global: Global;
}

export default class World extends GameClass {
  global: Global;
  container: PIXI.Container;
  layers: Layers;

  constructor({ global }: WorldProps) {
    super();
    this.global = global;
    this.container = new PIXI.Container();
    this.global.app.stage.addChild(this.container);

    this.layers = {
      ground: new Ground({ global: this.global }),
    };
  }

  destructor() {
    for (const value of Object.values(this.layers)) value.destructor();
    this.global.app.stage.removeChild(this.container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    for (const value of Object.values(this.layers)) value.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    for (const value of Object.values(this.layers)) value.gameLoop(deltaInSeconds);
  }
}
