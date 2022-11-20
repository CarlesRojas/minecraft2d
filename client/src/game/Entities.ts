import { Dimensions, Global } from '@game/Controller';
import Player from '@game/Player';
import { EntityArray } from '@util/abstract/EntityArray';
import { Mono } from '@util/abstract/Mono';
import * as PIXI from 'pixi.js';

export interface EntitiesProps {
  global: Global;
}

export default class Entities implements Mono, EntityArray<Player> {
  private _global: Global;
  private _container: PIXI.Container;

  entityArray: Player[] = [];

  constructor({ global }: EntitiesProps) {
    this._global = global;
    this._container = new PIXI.Container();
    this._global.stage.addChild(this._container);

    this.entityArray.push(new Player({ global }));
  }

  destructor() {
    this._global.stage.removeChild(this._container);
    for (const entity of this.entityArray) entity.destructor();
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    for (const entity of this.entityArray) entity.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    for (const entity of this.entityArray) entity.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   GETTERS
  // #################################################

  get player() {
    return this.entityArray[0];
  }
}
