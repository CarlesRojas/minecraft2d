import { Dimensions, Global } from '@game/Controller';
import { CharacterType, getCharacterTexture } from '@game/tool/Textures';
import { Entity } from '@util/EntityTypes';
import GameClass from '@util/GameClass';
import * as PIXI from 'pixi.js';

export interface CharacterSpriteProps {
  global: Global;
  container: PIXI.Container;
  HEIGHT: number;
  WIDTH: number;
  texture: CharacterType;
  info: Entity;
}

export default class CharacterSprite extends GameClass {
  // GLOBAL
  private _global: Global;
  private _container: PIXI.Container;
  private _HEIGHT: number = 0;
  private _WIDTH: number = 0;
  private _info: Entity;

  // SPRITES
  private _sprites: { [key: string]: PIXI.Sprite } = {};

  // ANIMATION
  private _currentAnimation: string = 'idle';

  private _idleAnimationSpeed = 4; // Seconds per cycle
  private _idleArmsYPosition = 0; // Seconds per cycle
  private _idleArmsYAmplitude = 0.3; // Amplitude of animation in texture px

  private _walkingAnimationSpeed = 6; // Seconds per cycle
  private _walkingArmsYAmplitude = 30; // Amplitude of animation in degrees
  private _walkingLegsYAmplitude = 35;

  constructor({ global, container, HEIGHT, WIDTH, texture, info }: CharacterSpriteProps) {
    super();

    // GLOBAL
    this._global = global;
    this._container = container;
    this._HEIGHT = HEIGHT;
    this._WIDTH = WIDTH;
    this._info = info;

    // SPRITES
    for (const [key, { size }] of Object.entries(this._info.parts)) {
      const { x, y, width, height } = size;
      this._sprites[key] = new PIXI.Sprite(getCharacterTexture(texture, new PIXI.Rectangle(x, y, width, height)));
      this._container.addChild(this._sprites[key]);
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
    const twoPX = this._HEIGHT * 0.125 * 0.5;
    const fourPX = twoPX * 2;
    const sixPX = twoPX * 3;
    const eightPX = fourPX * 2;
    const twelvePX = fourPX * 3;
    const sixteenPX = eightPX * 2;

    const pixel: { [key: number]: number } = {
      [2]: this._HEIGHT * 0.125 * 0.5,
      [-2]: this._HEIGHT * 0.125 * 0.5,
      [4]: twoPX * 2,
      [-4]: twoPX * 2,
      [6]: sixPX,
      [-6]: sixPX,
      [8]: eightPX,
      [-8]: eightPX,
      [12]: twelvePX,
      [-12]: twelvePX,
      [16]: sixteenPX,
      [-16]: sixteenPX,
    };

    for (const key in this._info.parts) {
      const { width, height } = this._info.parts[key].size;
      const { x: originX, y: originY } = this._info.parts[key].origin;
      const { x: anchorX, y: anchorY } = this._info.parts[key].anchor;
      const zIndex = this._info.parts[key].zIndex;

      this._sprites[key].width = pixel[width] * tile;
      this._sprites[key].height = pixel[height] * tile;
      this._sprites[key].x = pixel[originX] * tile;
      this._sprites[key].y = pixel[originY] * tile;
      this._sprites[key].anchor.set(anchorX, anchorY);
      this._sprites[key].zIndex = zIndex;
    }
  }

  // #################################################
  //   ANIMATIONS
  // #################################################

  setAnimation(animation: string, force = false) {
    // if (!force && this._currentAnimation === animation) return;
    // this._currentAnimation = animation;
    // this._torso.visible = animation === 'idle';
    // this._head.visible = animation === 'idle';
    // this._leftArm.visible = animation === 'idle';
    // this._rightArm.visible = animation === 'idle';
    // this._leftLeg.visible = animation === 'idle';
    // this._rightLeg.visible = animation === 'idle';
    // this._torsoLSide.visible = animation === 'walk_left';
    // this._headLSide.visible = animation === 'walk_left';
    // this._leftArmLSide.visible = animation === 'walk_left';
    // this._rightArmLSide.visible = animation === 'walk_left';
    // this._leftLegLSide.visible = animation === 'walk_left';
    // this._rightLegLSide.visible = animation === 'walk_left';
    // this._torsoRSide.visible = animation === 'walk_right';
    // this._headRSide.visible = animation === 'walk_right';
    // this._leftArmRSide.visible = animation === 'walk_right';
    // this._rightArmRSide.visible = animation === 'walk_right';
    // this._leftLegRSide.visible = animation === 'walk_right';
    // this._rightLegRSide.visible = animation === 'walk_right';
  }

  #updateAnimations() {
    // const time = Date.now();
    // const pixelSize = this._global.dimensions.tile / 16;
    // // IDLE
    // if (this._currentAnimation === 'idle') {
    //   const idleSin = Math.sin((time / 1000) * this._idleAnimationSpeed);
    //   this._leftArm.position = new Vector2(
    //     this._leftArm.x,
    //     this._idleArmsYPosition + idleSin * this._idleArmsYAmplitude * pixelSize
    //   );
    //   this._rightArm.position = new Vector2(
    //     this._rightArm.x,
    //     this._idleArmsYPosition + idleSin * this._idleArmsYAmplitude * pixelSize
    //   );
    // }
    // // WALK LEFT
    // else if (this._currentAnimation === 'walk_left') {
    //   const walkingSin = Math.sin((time / 1000) * this._walkingAnimationSpeed);
    //   this._leftArmLSide.rotation = walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    //   this._rightArmLSide.rotation = -walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    //   this._leftLegLSide.rotation = -walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    //   this._rightLegLSide.rotation = walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    // }
    // // WALK RIGHT
    // else if (this._currentAnimation === 'walk_right') {
    //   const walkingSin = Math.sin((time / 1000) * this._walkingAnimationSpeed);
    //   this._leftArmRSide.rotation = walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    //   this._rightArmRSide.rotation = -walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    //   this._leftLegRSide.rotation = -walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    //   this._rightLegRSide.rotation = walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    // }
  }
}
