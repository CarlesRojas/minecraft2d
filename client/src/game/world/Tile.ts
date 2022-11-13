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
  isBackground: boolean;
}

export default class Tile extends GameClass {
  private _coords: Vector2;
  private _type: TileType = TileType.NONE;
  private _sprite: PIXI.Sprite | null = null;
  private _shadowSprite: PIXI.Sprite | null = null;
  private _container: PIXI.Container;
  private _isBackground: boolean;

  constructor({ coords, container, dimensions, type, isBackground }: TileProps) {
    super();
    this._coords = coords;
    this._container = container;
    this._type = type;
    this._isBackground = isBackground;

    if (type === TileType.NONE) return;

    const texture = getTileTexture(this._type);

    this._sprite = new PIXI.Sprite(texture);
    this._sprite.anchor.set(0.5);
    this._sprite.zIndex = 0;

    if (this._isBackground) this._sprite.tint = 0x888888;
    else {
      this._shadowSprite = new PIXI.Sprite(texture);
      this._shadowSprite.zIndex = -1;
      this._shadowSprite.tint = 0x444444;
      this._shadowSprite.anchor.set(0.5);
      this._container.addChild(this._shadowSprite);
    }

    this._container.addChild(this._sprite);
    this.handleResize(dimensions);
  }

  destructor() {
    if (this._shadowSprite) this._container.removeChild(this._shadowSprite);
    if (this._sprite) this._container.removeChild(this._sprite);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    if (!this._sprite) return;
    this._sprite.position.set(this._coords.x * tile, this._coords.y * tile);
    this._sprite.width = tile;
    this._sprite.height = tile;

    if (!this._shadowSprite) return;
    this._shadowSprite.position.set(this._coords.x * tile, this._coords.y * tile);
    this._shadowSprite.width = tile + 6;
    this._shadowSprite.height = tile + 6;
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
