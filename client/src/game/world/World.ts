import { SAFTY_TILES } from '@game/constant/constants';
import { Dimensions, Global } from '@game/Controller';
import Background from '@game/world/Background';
import Ground from '@game/world/Ground';
import { Mono } from '@util/abstract/Mono';
import Vector2 from '@util/Vector2';
import * as PIXI from 'pixi.js';

export interface Layers {
  ground: Ground;
  background: Background;
}

export interface RenderArea {
  start: Vector2;
  end: Vector2;
}

export interface WorldProps {
  global: Global;
}

export default class World implements Mono {
  private _global: Global;
  private _container: PIXI.Container;
  private _layers: Layers;
  private _renderArea: RenderArea;
  private _lastRenderArea: RenderArea | null;

  constructor({ global }: WorldProps) {
    this._global = global;
    this._container = new PIXI.Container();
    this._global.stage.addChild(this._container);

    this._layers = {
      background: new Background({ global }),
      ground: new Ground({ global }),
    };

    this._renderArea = {
      start: new Vector2(0, 0),
      end: new Vector2(0, 0),
    };
    this._lastRenderArea = null;
  }

  destructor() {
    for (const value of Object.values(this._layers)) value.destructor();
    this._global.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    for (const value of Object.values(this._layers)) value.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.#updateRenderArea();
    for (const value of Object.values(this._layers)) value.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   RENDER AREA
  // #################################################

  async #updateRenderArea() {
    const { screen, tile } = this._global.dimensions;
    const playerPosition = this._global.controller.entities.player.roundedPosition;

    const horizontalNumberOfTiles = Math.ceil(screen.x / tile / 2) + SAFTY_TILES;
    const verticalNumberOfTiles = Math.ceil(screen.y / tile / 2) + SAFTY_TILES;

    this._renderArea = {
      start: new Vector2(playerPosition.x - horizontalNumberOfTiles, playerPosition.y - verticalNumberOfTiles),
      end: new Vector2(playerPosition.x + horizontalNumberOfTiles, playerPosition.y + verticalNumberOfTiles),
    };

    if (
      this._lastRenderArea &&
      this._lastRenderArea.start.equals(this._renderArea.start) &&
      this._lastRenderArea.end.equals(this._renderArea.end)
    )
      return;

    this._lastRenderArea = this._renderArea;

    for (const value of Object.values(this._layers)) value.updateRenderArea(this._renderArea);
  }

  // #################################################
  //   GETTERS
  // #################################################

  get ground() {
    return this._layers.ground;
  }

  get background() {
    return this._layers.background;
  }
}
