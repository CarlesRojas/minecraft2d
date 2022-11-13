import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { RenderArea } from '@game/world/World';
import Tile from '@game/world/Tile';
import Vector2 from '@util/Vector2';
import { getTileTypeInCoords } from '@game/tools/Terrain';

export interface GroundProps {
  global: Global;
}

export default class Ground extends GameClass {
  private _global: Global;
  private _container: PIXI.Container;
  private _renderedTiles: { [key: string]: Tile };

  constructor({ global }: GroundProps) {
    super();
    this._global = global;

    this._container = new PIXI.Container();
    this._global.app.stage.addChild(this._container);

    this._renderedTiles = {};
  }

  destructor() {
    for (const tile of Object.values(this._renderedTiles)) tile.destructor();
    this._global.app.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    for (const tile of Object.values(this._renderedTiles)) tile.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    for (const tile of Object.values(this._renderedTiles)) tile.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   RENDER AREA
  // #################################################

  async #instantiateTile(key: string, coords: Vector2) {
    const type = await getTileTypeInCoords(coords);

    this._renderedTiles[key] = new Tile({
      coords: new Vector2(coords.x, coords.y),
      container: this._container,
      dimensions: this._global.dimensions,
      type,
    });
  }

  updateRenderArea(renderArea: RenderArea) {
    const { start, end } = renderArea;
    const { x: startX, y: startY } = start;
    const { x: endX, y: endY } = end;

    // Remove tiles that are no longer in the render area
    for (const key in this._renderedTiles) {
      const tile = this._renderedTiles[key];
      const { x, y } = tile.coords;
      if (x < startX || x > endX || y < startY || y > endY) {
        tile.destructor();
        delete this._renderedTiles[key];
      }
    }

    // Add tiles that are in the render area but not rendered
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const coords = new Vector2(x, y);
        const key = coords.toString();
        if (this._renderedTiles[key]) continue;
        this.#instantiateTile(key, coords);
      }
    }
  }
}
