import { Dimensions } from '@game/Controller';
import { getTileTexture, TileType } from '@game/tool/Textures';
import { Mono } from '@util/abstract/Mono';
import Vector2 from '@util/Vector2';
import * as PIXI from 'pixi.js';

export interface TileProps {
  coords: Vector2;
  container: PIXI.Container;
  dimensions: Dimensions;
  type: TileType;
  isBackground: boolean;
}

const roundToNearestEven = (num: number) => Math.round(num / 2) * 2;

export default class Tile implements Mono {
  private _coords: Vector2;
  private _type: TileType = TileType.NONE;
  private _sprite: PIXI.Sprite | null = null;
  private _shadowSprite: PIXI.Sprite | null = null;
  private _container: PIXI.Container;
  private _isBackground: boolean;
  private _debug: boolean = false;
  private _text: PIXI.Text | null = null;

  constructor({ coords, container, dimensions, type, isBackground }: TileProps) {
    this._coords = coords;
    this._container = container;
    this._type = type;
    this._isBackground = isBackground;

    if (type === TileType.NONE) return;

    const texture = getTileTexture(this._type);

    this._sprite = new PIXI.Sprite(texture);
    this._sprite.anchor.set(0.5);
    this._sprite.zIndex = 0;

    if (this._isBackground) this._sprite.tint = 0x999999;
    else {
      this._shadowSprite = new PIXI.Sprite(texture);
      this._shadowSprite.zIndex = -1;
      this._shadowSprite.tint = 0x222222;
      this._shadowSprite.anchor.set(0.5);
      this._container.addChild(this._shadowSprite);
    }

    if (this._debug) {
      this._text = new PIXI.Text(this._coords.toString(), { fill: 0x00ff00, fontSize: 14 });
      this._text.anchor.set(0.5);
      this._text.zIndex = 1;
      this._container.addChild(this._text);
    }

    this._container.addChild(this._sprite);
    this.handleResize(dimensions);
  }

  destructor() {
    if (this._shadowSprite) this._container.removeChild(this._shadowSprite);
    if (this._sprite) this._container.removeChild(this._sprite);
    if (this._text) this._container.removeChild(this._text);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    if (this._sprite) {
      this._sprite.position.set(this._coords.x * tile, this._coords.y * tile);
      this._sprite.width = tile;
      this._sprite.height = tile;
    }

    if (this._shadowSprite) {
      this._shadowSprite.position.set(this._coords.x * tile, this._coords.y * tile);
      this._shadowSprite.width = tile + roundToNearestEven(tile * 0.12);
      this._shadowSprite.height = tile + roundToNearestEven(tile * 0.12);
    }

    if (this._text) {
      this._text.position.set(this._coords.x * tile, this._coords.y * tile);
    }
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

  get bounds() {
    if (!this._sprite) return null;
    return this._sprite.getBounds();
  }
}
