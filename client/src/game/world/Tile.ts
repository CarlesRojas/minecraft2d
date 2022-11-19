import { Dimensions } from '@game/Controller';
import { getTileTexture, TileType } from '@game/tool/Textures';
import { Interactible, InteractionLayer } from '@util/abstract/Interactible';
import { Mono } from '@util/abstract/Mono';
import { Bounds } from '@util/EntityTypes';
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
const BACKGROUND_TINT = 0x999999;

export default class Tile implements Mono, Interactible {
  private _container: PIXI.Container;

  // SPRITES
  private _sprite: PIXI.Sprite | null = null;
  private _shadowSprite: PIXI.Sprite | null = null;
  private _highlightSprite: PIXI.Sprite | null = null;

  // PROPERTIES
  private _coords: Vector2;
  private _type: TileType = TileType.NONE;
  private _isBackground: boolean;
  interactionLayer: InteractionLayer;

  // DEBUG
  private _debug = false;
  private _text: PIXI.Text | null = null;

  constructor({ coords, container, dimensions, type, isBackground }: TileProps) {
    this._coords = coords;
    this._container = container;
    this._type = type;
    this._isBackground = isBackground;
    this.interactionLayer = isBackground ? InteractionLayer.BACKGROUND : InteractionLayer.GROUND;

    if (type === TileType.NONE) {
      this.interactionLayer = InteractionLayer.AIR;
      return;
    }

    const texture = getTileTexture(this._type);

    this._sprite = new PIXI.Sprite(texture);
    this._sprite.anchor.set(0.5);
    this._sprite.zIndex = 0;
    if (this._isBackground) this._sprite.tint = BACKGROUND_TINT;

    this._shadowSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this._shadowSprite.zIndex = -1;
    this._shadowSprite.tint = 0x000000;
    this._shadowSprite.anchor.set(0.5);
    if (this._isBackground) this._shadowSprite.visible = false;

    this._highlightSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this._highlightSprite.zIndex = 1;
    this._highlightSprite.tint = 0xffffff;
    this._highlightSprite.alpha = 0.9;
    this._highlightSprite.anchor.set(0.5);
    this._highlightSprite.visible = false;

    if (this._debug) {
      this._text = new PIXI.Text(this._coords.toString(), { fill: 0x00ff00, fontSize: 14 });
      this._text.anchor.set(0.5);
      this._text.zIndex = 1;
      this._container.addChild(this._text);
    }

    this._container.addChild(this._shadowSprite);
    this._container.addChild(this._highlightSprite);
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
      const shadowWidth = tile + roundToNearestEven(tile * 0.1);
      this._shadowSprite.width = shadowWidth;
      this._shadowSprite.height = shadowWidth;
    }

    if (this._highlightSprite) {
      this._highlightSprite.position.set(this._coords.x * tile, this._coords.y * tile);
      const highlightWidth = tile + roundToNearestEven(tile * 0.04);
      this._highlightSprite.width = highlightWidth;
      this._highlightSprite.height = highlightWidth;
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
  //   INTERACTIBLE
  // #################################################

  highlight(): void {
    if (!this._sprite || !this._highlightSprite) return;
    this._sprite.zIndex = 2;
    this._highlightSprite.visible = true;
  }

  unhighlight(): void {
    if (!this._sprite || !this._highlightSprite) return;
    this._highlightSprite.visible = false;
    this._sprite.zIndex = 0;
  }

  interact(): void {
    throw new Error('Method not implemented.');
  }

  get getBounds(): Bounds {
    const bounds: Bounds = {
      x: this._coords.x - 0.5,
      y: this._coords.y - 0.5,
      width: 1,
      height: 1,
    };

    return bounds;
  }

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
