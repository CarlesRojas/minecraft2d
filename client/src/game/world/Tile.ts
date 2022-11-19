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
  // GLOBAL
  private _container: PIXI.Container;
  private _dimensions: Dimensions;

  // SPRITES
  private _sprite: PIXI.Sprite | null = null;
  private _shadowSprite: PIXI.Sprite | null = null;
  private _highlightSprite: PIXI.Sprite | null = null;
  private _destroySprites: PIXI.Sprite[] = [];

  // PROPERTIES
  private _coords: Vector2;
  private _type: TileType = TileType.NONE;
  private _isBackground: boolean = false;
  interactionLayer: InteractionLayer = InteractionLayer.AIR;

  // BREAKING
  private _isBreaking = false;
  private _isReparing = false;
  private _breakingTime = 1; // In seconds
  private _currentBreakingTime = 0;

  // DEBUG
  private _debug = false;
  private _text: PIXI.Text | null = null;

  constructor({ coords, container, dimensions, type, isBackground }: TileProps) {
    this._coords = coords;
    this._container = container;
    this._dimensions = dimensions;

    this.setTile(type, isBackground);
  }

  destructor() {
    for (const sprite of this._destroySprites) this._container.removeChild(sprite);
    if (this._sprite) this._container.removeChild(this._sprite);
    if (this._shadowSprite) this._container.removeChild(this._shadowSprite);
    if (this._highlightSprite) this._container.removeChild(this._highlightSprite);
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

    for (const sprite of this._destroySprites) {
      sprite.position.set(this._coords.x * tile, this._coords.y * tile);
      sprite.width = tile;
      sprite.height = tile;
    }

    if (this._text) {
      this._text.position.set(this._coords.x * tile, this._coords.y * tile);
    }
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.#continueBreaking(deltaInSeconds);
  }

  // #################################################
  //   BREAKING
  // #################################################

  #continueBreaking(deltaInSeconds: number) {
    if (!this._isBreaking && !this._isReparing) return;

    if (this._isBreaking) this._currentBreakingTime += deltaInSeconds;
    else if (this._isReparing) this._currentBreakingTime -= deltaInSeconds;

    const destroyState = Math.floor((this._currentBreakingTime / this._breakingTime) * this._destroySprites.length);
    for (let i = 0; i < this._destroySprites.length; i++) this._destroySprites[i].visible = i === destroyState;

    if (this._currentBreakingTime >= this._breakingTime) this.#break();
    if (this._currentBreakingTime <= 0) this.#repair();
  }

  #break() {
    // TODO instantiate tile item
    this._isBreaking = false;
    this._isReparing = false;
    this._currentBreakingTime = 0;
    this.destructor();
    this.setTile(TileType.NONE, false);
  }

  #repair() {
    this._isBreaking = false;
    this._isReparing = false;
    this._currentBreakingTime = 0;
    for (const sprite of this._destroySprites) sprite.visible = false;
  }

  // #################################################
  //   INTERACTIBLE
  // #################################################

  highlight(): void {
    if (!this._sprite || !this._highlightSprite) return;
    this._sprite.zIndex = 2;
    this._highlightSprite.visible = true;
  }

  stopHighlighting(): void {
    if (!this._sprite || !this._highlightSprite) return;
    this._highlightSprite.visible = false;
    this._sprite.zIndex = 0;
  }

  interact(): void {
    this._isBreaking = true;
    this._isReparing = false;
  }

  stopInteracting(): void {
    this._isBreaking = false;
    this._isReparing = true;
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

  // #################################################
  //   SETTERS
  // #################################################

  setTile(type: TileType, isBackground: boolean) {
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

    for (const texture of [
      TileType.DESTROY_STATE_0,
      TileType.DESTROY_STATE_1,
      TileType.DESTROY_STATE_2,
      TileType.DESTROY_STATE_3,
      TileType.DESTROY_STATE_4,
      TileType.DESTROY_STATE_5,
      TileType.DESTROY_STATE_6,
      TileType.DESTROY_STATE_7,
      TileType.DESTROY_STATE_8,
      TileType.DESTROY_STATE_9,
    ]) {
      const sprite = new PIXI.Sprite(getTileTexture(texture));
      sprite.anchor.set(0.5);
      sprite.zIndex = 2;
      sprite.visible = false;
      sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      this._destroySprites.push(sprite);
    }

    if (this._debug) {
      this._text = new PIXI.Text(this._coords.toString(), { fill: 0x00ff00, fontSize: 14 });
      this._text.anchor.set(0.5);
      this._text.zIndex = 1;
      this._container.addChild(this._text);
    }

    for (const sprite of this._destroySprites) this._container.addChild(sprite);
    this._container.addChild(this._shadowSprite);
    this._container.addChild(this._highlightSprite);
    this._container.addChild(this._sprite);

    this.handleResize(this._dimensions);
  }
}
