import { Dimensions, Global } from '@game/Controller';
import { CollisionLayer, Interactible, InteractionLayer } from '@game/interface/Interactible';
import { Mono } from '@game/interface/Mono';
import { getTileTexture, TileType } from '@game/system/Textures';
import { Bounds } from '@game/util/EntityTypes';
import Vector2 from '@game/util/Vector2';
import * as PIXI from 'pixi.js';
import { TileProps } from './Tile';

const roundToNearestEven = (num: number) => Math.round(num / 2) * 2;
const BACKGROUND_TINT = 0x999999;

export default class TileObject implements Mono, Interactible {
  // GLOBAL
  protected _global: Global;
  protected _container: PIXI.Container;
  protected _dimensions: Dimensions;
  protected _handleBreak: () => void;

  // SPRITES
  protected _sprite: PIXI.Sprite | null = null;
  protected _shadowSprite: PIXI.Sprite | null = null;
  protected _highlightSprite: PIXI.Sprite | null = null;
  protected _destroySprites: PIXI.Sprite[] = [];

  // PROPERTIES
  protected _coords: Vector2;
  protected _type: TileType;
  protected _isBackground: boolean;
  interactionLayer: InteractionLayer = InteractionLayer.NONE;
  collisionLayer: CollisionLayer = CollisionLayer.NONE;

  // BREAKING
  protected _isBreaking = false;
  protected _isReparing = false;
  protected _breakingTime = 1; // In seconds
  protected _currentBreakingTime = 0;

  constructor({ global, coords, container, dimensions, type, isBackground }: TileProps, handleBreak: () => void) {
    this._global = global;
    this._coords = coords;
    this._container = container;
    this._dimensions = dimensions;
    this._type = type;
    this._isBackground = isBackground;
    this._handleBreak = handleBreak;

    this.setLayers(type);
    if (type === TileType.NONE) return;

    this.#setSprites();
    this.handleResize(this._dimensions);
  }

  // #################################################
  //   MONO
  // #################################################

  destructor() {
    for (const sprite of this._destroySprites) this._container.removeChild(sprite);
    if (this._sprite) this._container.removeChild(this._sprite);
    if (this._shadowSprite) this._container.removeChild(this._shadowSprite);
    if (this._highlightSprite) this._container.removeChild(this._highlightSprite);
  }

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
      const highlightWidth = tile + roundToNearestEven(tile * 0.1);
      this._highlightSprite.width = highlightWidth;
      this._highlightSprite.height = highlightWidth;
    }

    for (const sprite of this._destroySprites) {
      sprite.position.set(this._coords.x * tile, this._coords.y * tile);
      sprite.width = tile;
      sprite.height = tile;
    }
  }

  gameLoop(deltaInSeconds: number) {
    this.#continueBreaking(deltaInSeconds);
  }

  // #################################################
  //   INTERACTIBLE
  // #################################################

  highlight() {
    if (!this._sprite || !this._highlightSprite) return;
    this._sprite.zIndex = 2;
    this._highlightSprite.visible = true;
  }

  stopHighlighting() {
    if (!this._sprite || !this._highlightSprite) return;
    this._highlightSprite.visible = false;
    this._sprite.zIndex = 0;
  }

  interact() {
    this._isBreaking = true;
    this._isReparing = false;
  }

  stopInteracting() {
    this._isBreaking = false;
    this._isReparing = true;
  }

  interactSecondary() {}

  isInteractable() {
    return false;
  }

  shouldCollide() {
    return true;
  }

  get bounds() {
    const bounds: Bounds = {
      x: this._coords.x - 0.5,
      y: this._coords.y - 0.5,
      width: 1,
      height: 1,
    };

    return bounds;
  }

  get occupied() {
    return this._type !== TileType.NONE;
  }

  get type() {
    return this._type;
  }

  // #################################################
  //   BREAKING
  // #################################################

  #continueBreaking(deltaInSeconds: number) {
    if (!this._isBreaking && !this._isReparing) return;

    if (this._isBreaking) this._currentBreakingTime += deltaInSeconds;
    else if (this._isReparing) this._currentBreakingTime -= deltaInSeconds * 0.5;

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
    this._handleBreak();
  }

  #repair() {
    this._isBreaking = false;
    this._isReparing = false;
    this._currentBreakingTime = 0;
    for (const sprite of this._destroySprites) sprite.visible = false;
  }

  // #################################################
  //   SETTERS
  // #################################################

  setType(type: TileType) {
    const texture = getTileTexture(type);
    if (this._sprite) this._sprite.texture = texture;
    this._type = type;
    this.setLayers(this._type);
  }

  #setSprites() {
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
    this._highlightSprite.tint = 0xeeeeee;
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

    for (const sprite of this._destroySprites) this._container.addChild(sprite);
    this._container.addChild(this._shadowSprite);
    this._container.addChild(this._highlightSprite);
    this._container.addChild(this._sprite);
  }

  setLayers(type: TileType) {
    this.interactionLayer = this._isBackground ? InteractionLayer.BACKGROUND : InteractionLayer.GROUND;
    this.collisionLayer = this._isBackground ? CollisionLayer.NONE : CollisionLayer.GROUND;

    if (type === TileType.NONE) {
      this.interactionLayer = InteractionLayer.NONE;
      this.collisionLayer = CollisionLayer.NONE;
    }
  }
}
