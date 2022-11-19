import { Dimensions, Global } from '@game/Controller';
import { getTileTypeInCoords } from '@game/tool/Terrain';
import Tile from '@game/world/Tile';
import { RenderArea } from '@game/world/World';
import { Mono } from '@util/abstract/Mono';
import { CoordsMap, TileMap } from '@util/abstract/TileMap';
import Vector2 from '@util/Vector2';
import * as PIXI from 'pixi.js';

export interface BackgroundProps {
  global: Global;
}

export default class Background implements Mono, TileMap<Tile> {
  private _global: Global;
  private _container: PIXI.Container;
  tilemap: CoordsMap<Tile>;

  constructor({ global }: BackgroundProps) {
    this._global = global;

    this._container = new PIXI.Container();
    this._container.sortableChildren = true;
    this._global.app.stage.addChild(this._container);

    this.tilemap = {};
  }

  destructor() {
    for (const tile of Object.values(this.tilemap)) tile.destructor();
    this._global.app.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    for (const tile of Object.values(this.tilemap)) tile.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    for (const tile of Object.values(this.tilemap)) tile.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   RENDER AREA
  // #################################################

  async #instantiateTile(key: string, coords: Vector2) {
    const { backgroundType } = await getTileTypeInCoords(coords);

    this.tilemap[key] = new Tile({
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
    for (const key in this.tilemap) {
      const tile = this.tilemap[key];
      const { x, y } = tile.coords;
      if (x < startX || x > endX || y < startY || y > endY) {
        tile.destructor();
        delete this.tilemap[key];
      }
    }

    // Add tiles that are in the render area but not rendered
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const coords = new Vector2(x, y);
        const key = coords.toString();
        if (this.tilemap[key]) continue;
        this.#instantiateTile(key, coords);
      }
    }
  }

  // #################################################
  //   TILE MAP
  // #################################################

  get elementAtCoords() {
    return (coords: Vector2) => {
      const key = coords.toString();
      return key in this.tilemap ? this.tilemap[key] : null;
    };
  }
}
