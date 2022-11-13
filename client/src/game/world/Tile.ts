import * as PIXI from 'pixi.js';
import { Dimensions } from '@game/Controller';
import GameClass from '@util/GameClass';
import Vector2 from '@util/Vector2';
import { getTileTexture, TileType } from '@game/tools/Textures';

export interface TileProps {
  coords: Vector2;
  container: PIXI.Container;
  dimensions: Dimensions;
  type: TileType;
}

export default class Tile extends GameClass {
  private _coords: Vector2;
  private _type: TileType = TileType.NONE;
  private _sprite: PIXI.Sprite | null = null;
  private _container: PIXI.Container;

  constructor({ coords, container, dimensions, type }: TileProps) {
    super();
    this._coords = coords;
    this._container = container;
    this._type = type;

    if (type === TileType.NONE) return;

    this._sprite = new PIXI.Sprite(getTileTexture(this._type));
    this._sprite.anchor.set(0.5);
    this.handleResize(dimensions);

    this._container.addChild(this._sprite);
  }

  destructor() {
    if (this._sprite) this._container.removeChild(this._sprite);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    if (!this._sprite) return;

    const { tile } = dimensions;

    this._sprite.position.set(this._coords.x * tile, this._coords.y * tile);
    this._sprite.width = tile;
    this._sprite.height = tile;
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {}

  // #################################################
  //   GETTERS
  // #################################################

  get coords() {
    return this._coords;
  }

  get type() {
    return this._type;
  }
}
