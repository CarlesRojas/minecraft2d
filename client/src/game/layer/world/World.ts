import { SAFTY_TILES } from '@game/constant/constants';
import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@game/interface/Mono';
import { Area, RenderArea } from '@game/interface/RenderArea';
import { TileMap } from '@game/interface/TileMap';
import Background from '@game/layer/world/Background';
import Ground from '@game/layer/world/Ground';
import Tile from '@game/layer/world/tile/Tile';
import Vector2 from '@game/util/Vector2';
import * as PIXI from 'pixi.js';

interface Layers {
  ground: Mono & RenderArea & TileMap<Tile>;
  background: Mono & RenderArea & TileMap<Tile>;
}

interface WorldProps {
  global: Global;
}

export default class World implements Mono {
  private _global: Global;
  private _container: PIXI.Container;
  private _layers: Layers;
  private _renderArea: Area;
  private _lastRenderArea: Area | null;

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
    for (const layer of Object.values(this._layers)) layer.destructor();
    this._global.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    for (const layer of Object.values(this._layers)) layer.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.#updateRenderArea();
    for (const layer of Object.values(this._layers)) layer.gameLoop(deltaInSeconds);
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

    for (const layer of Object.values(this._layers)) layer.updateRenderArea(this._renderArea);
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
