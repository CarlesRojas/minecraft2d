import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@game/interface/Mono';
import { EntityType, getEntityTexture } from '@game/system/Textures';
import Entity from '@game/util/EntityTypes';
import Vector2 from '@game/util/Vector2';
import * as PIXI from 'pixi.js';

interface SpritesManagerProps {
  global: Global;
  container: PIXI.Container;
  pixel: number;
  texture: EntityType;
  info: Entity;
}

export default class SpritesManager implements Mono {
  // GLOBAL
  private _global: Global;
  private _container: PIXI.Container;
  private _pixel: number = 0;
  private _info: Entity;

  // SPRITES
  private _sprites: { [key: string]: PIXI.Sprite } = {};

  // ANIMATION
  private _currentAnimation: string = 'idle';

  private _basePosition: { [key: string]: { [key: string]: number }[] } = {};

  constructor({ global, container, pixel, texture, info }: SpritesManagerProps) {
    // GLOBAL
    this._global = global;
    this._container = container;
    this._pixel = pixel;
    this._info = info;

    // SPRITES
    for (const part in this._info.parts) {
      const { x, y, width, height } = this._info.parts[part].bounds;
      this._sprites[part] = new PIXI.Sprite(getEntityTexture(texture, new PIXI.Rectangle(x, y, width, height)));
      this._container.addChild(this._sprites[part]);
    }

    // ANIMATION
    this.setAnimation(Object.keys(this._info.states)[0], true);
  }

  destructor() {
    this._container.removeChildren();
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    this.#positionSprites(tile);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.#updateAnimations();
  }

  // #################################################
  //   SPRITE POSITIONS
  // #################################################

  #positionSprites(tile: number) {
    for (const part in this._info.parts) {
      const { width, height } = this._info.parts[part].bounds;
      const { x: originX, y: originY } = this._info.parts[part].origin;
      const { x: anchorX, y: anchorY } = this._info.parts[part].anchor;
      const zIndex = this._info.parts[part].zIndex;

      this._sprites[part].width = width * this._pixel * tile;
      this._sprites[part].height = height * this._pixel * tile;
      this._sprites[part].x = originX * this._pixel * tile;
      this._sprites[part].y = originY * this._pixel * tile;
      this._sprites[part].anchor.set(anchorX, anchorY);
      this._sprites[part].zIndex = zIndex;
    }

    // Set initial positions
    this._basePosition = {};

    for (const state in this._info.states) {
      this._basePosition[state] = [];

      for (const animation of this._info.states[state].animations) {
        const { parts, type } = animation;
        const partsPositions: { [key: string]: number } = {};

        for (const part of parts) {
          if (type === 'x') partsPositions[part] = this._sprites[part].x;
          else if (type === 'y') partsPositions[part] = this._sprites[part].y;
          else if (type === 'rotation') partsPositions[part] = 0;
        }

        this._basePosition[state].push(partsPositions);
      }
    }
  }

  // #################################################
  //   ANIMATIONS
  // #################################################

  setAnimation(animation: string, force = false) {
    if (!force && this._currentAnimation === animation) return;
    this._currentAnimation = animation;

    for (const part in this._info.parts) {
      const parts = this._info.states[animation]?.visibleParts;
      this._sprites[part].visible = parts && parts.includes(part);
    }
  }

  #updateAnimations() {
    const time = Date.now();
    const pixelSize = this._global.dimensions.tile / 16;

    for (const state in this._info.states) {
      if (state !== this._currentAnimation) continue;

      for (let i = 0; i < this._info.states[state].animations.length; i++) {
        const { speed, amplidude, parts, type, inverted } = this._info.states[state].animations[i];
        const sin = Math.sin((time / 1000) * speed);

        for (let j = 0; j < parts.length; j++) {
          const part = parts[j];
          const invert = inverted[j] ? -1 : 1;
          const initial = this._basePosition[state][i][part];

          if (type === 'x')
            this._sprites[part].position = new Vector2(
              initial + sin * amplidude * pixelSize * invert,
              this._sprites[part].y
            );
          else if (type === 'y')
            this._sprites[part].position = new Vector2(
              this._sprites[part].x,
              initial + sin * amplidude * pixelSize * invert
            );
          else if (type === 'rotation') this._sprites[part].rotation = sin * amplidude * (Math.PI / 180) * invert;
        }
      }
    }
  }
}
