import { Dimensions, Global } from '@game/Controller';
import Player from '@game/Player';
import { Mono } from '@util/abstract/Mono';
import * as PIXI from 'pixi.js';

interface EntitiesProps {
  global: Global;
}

export default class Entities implements Mono {
  private _global: Global;
  private _container: PIXI.Container;

  _player: Player;

  constructor({ global }: EntitiesProps) {
    this._global = global;
    this._container = new PIXI.Container();
    this._global.stage.addChild(this._container);

    this._player = new Player({ global });
  }

  destructor() {
    this._global.stage.removeChild(this._container);
    this._player.destructor();
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    this._player.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this._player.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   GETTERS
  // #################################################

  get player() {
    return this._player;
  }
}
