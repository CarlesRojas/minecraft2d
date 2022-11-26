import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@game/interface/Mono';
import { Area, RenderArea } from '@game/interface/RenderArea';
import { CoordsMap, TileMap } from '@game/interface/TileMap';
import Tile from '@game/layer/world/tile/Tile';
import { getTileTypeInCoords } from '@game/system/Terrain';
import { TileType } from '@game/system/Textures';
import Vector2 from '@game/util/Vector2';
import * as PIXI from 'pixi.js';

interface GroundProps {
  global: Global;
}

export default class Ground implements Mono, TileMap<Tile>, RenderArea {
  private _global: Global;
  private _container: PIXI.Container;
  tilemap: CoordsMap<Tile>;

  // DEBUG
  private _debug = true;
  private _middleOfWorld: PIXI.Sprite | null = null;

  constructor({ global }: GroundProps) {
    this._global = global;

    this._container = new PIXI.Container();
    this._container.sortableChildren = true;
    this._global.stage.addChild(this._container);

    if (this._debug) {
      this._middleOfWorld = new PIXI.Sprite(PIXI.Texture.WHITE);
      this._middleOfWorld.width = 8;
      this._middleOfWorld.height = 8;
      this._middleOfWorld.anchor.set(0.5, 0.5);
      this._middleOfWorld.zIndex = 100;
      this._middleOfWorld.position.set(0, 0);
      this._middleOfWorld.tint = 0x00ff00;
      this._container.addChild(this._middleOfWorld);
    }

    this.tilemap = {};
  }

  destructor() {
    for (const tile of Object.values(this.tilemap)) tile.destructor();
    if (this._middleOfWorld) this._container.removeChild(this._middleOfWorld);
    this._global.stage.removeChild(this._container);
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
    const { groundType, isCave } = await getTileTypeInCoords(coords);

    this.tilemap[key] = new Tile({
      global: this._global,
      coords: new Vector2(coords.x, coords.y),
      container: this._container,
      dimensions: this._global.dimensions,
      type: isCave ? TileType.NONE : groundType,
      isBackground: false,
    });
  }

  updateRenderArea(renderArea: Area) {
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
