import { Dimensions, Global } from '@game/Controller';
import { getTileTypeInCoords } from '@game/tool/Terrain';
import Tile from '@game/world/Tile';
import { RenderArea } from '@game/world/World';
import { Mono } from '@util/abstract/Mono';
import Vector2 from '@util/Vector2';
import * as PIXI from 'pixi.js';

export interface BackgroundProps {
  global: Global;
}

export default class Background implements Mono {
  private _global: Global;
  private _container: PIXI.Container;
  private _renderedTiles: { [key: string]: Tile };

  constructor({ global }: BackgroundProps) {
    this._global = global;

    this._container = new PIXI.Container();
    this._container.sortableChildren = true;
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
    const { backgroundType } = await getTileTypeInCoords(coords);

    this._renderedTiles[key] = new Tile({
      coords: new Vector2(coords.x, coords.y),
      container: this._container,
      dimensions: this._global.dimensions,
      type: backgroundType,
      isBackground: true,
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
