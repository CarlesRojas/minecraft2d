import { Dimensions, Global } from '@game/Controller';
import { CharacterType, getCharacterTexture } from '@game/tool/Textures';
import GameClass from '@util/GameClass';
import Vector2 from '@util/Vector2';
import * as PIXI from 'pixi.js';

export interface CharacterSpriteProps {
  global: Global;
  container: PIXI.Container;
  HEIGHT: number;
  WIDTH: number;
}

export default class CharacterSprite extends GameClass {
  // GLOBAL
  private _global: Global;
  private _container: PIXI.Container;
  private _HEIGHT: number = 0;
  private _WIDTH: number = 0;

  // SPRITES
  private _head: PIXI.Sprite;
  private _torso: PIXI.Sprite;
  private _leftArm: PIXI.Sprite;
  private _rightArm: PIXI.Sprite;
  private _leftLeg: PIXI.Sprite;
  private _rightLeg: PIXI.Sprite;

  private _headLSide: PIXI.Sprite;
  private _torsoLSide: PIXI.Sprite;
  private _leftArmLSide: PIXI.Sprite;
  private _rightArmLSide: PIXI.Sprite;
  private _leftLegLSide: PIXI.Sprite;
  private _rightLegLSide: PIXI.Sprite;

  private _headRSide: PIXI.Sprite;
  private _torsoRSide: PIXI.Sprite;
  private _leftArmRSide: PIXI.Sprite;
  private _rightArmRSide: PIXI.Sprite;
  private _leftLegRSide: PIXI.Sprite;
  private _rightLegRSide: PIXI.Sprite;

  // ANIMATION
  private _currentAnimation: string = 'idle';

  private _idleAnimationSpeed = 4; // Seconds per cycle
  private _idleArmsYPosition = 0; // Seconds per cycle
  private _idleArmsYAmplitude = 0.3; // Amplitude of animation in texture px

  private _walkingAnimationSpeed = 6; // Seconds per cycle
  private _walkingArmsYAmplitude = 30; // Amplitude of animation in degrees
  private _walkingLegsYAmplitude = 35;

  constructor({ global, container, HEIGHT, WIDTH }: CharacterSpriteProps) {
    super();

    // GLOBAL
    this._global = global;
    this._container = container;
    this._HEIGHT = HEIGHT;
    this._WIDTH = WIDTH;

    // SPRITES
    this._head = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(8, 8, 8, 8)));
    this._torso = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(20, 20, 8, 12)));
    this._leftArm = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(44, 20, 4, 12)));
    this._rightArm = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(36, 52, 4, 12)));
    this._leftLeg = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(4, 20, 4, 12)));
    this._rightLeg = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(20, 52, 4, 12)));

    this._headLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(16, 8, 8, 8)));
    this._torsoLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(28, 20, 4, 12)));
    this._leftArmLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(48, 20, 4, 12)));
    this._rightArmLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(40, 52, 4, 12)));
    this._leftLegLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(8, 20, 4, 12)));
    this._rightLegLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(24, 52, 4, 12)));

    this._headRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(0, 8, 8, 8)));
    this._torsoRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(16, 20, 4, 12)));
    this._leftArmRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(40, 20, 4, 12)));
    this._rightArmRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(32, 52, 4, 12)));
    this._leftLegRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(0, 20, 4, 12)));
    this._rightLegRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(16, 52, 4, 12)));

    this.setAnimation('idle', true);

    this._container.addChild(this._head);
    this._container.addChild(this._torso);
    this._container.addChild(this._leftArm);
    this._container.addChild(this._rightArm);
    this._container.addChild(this._leftLeg);
    this._container.addChild(this._rightLeg);

    this._container.addChild(this._headLSide);
    this._container.addChild(this._torsoLSide);
    this._container.addChild(this._leftArmLSide);
    this._container.addChild(this._rightArmLSide);
    this._container.addChild(this._leftLegLSide);
    this._container.addChild(this._rightLegLSide);

    this._container.addChild(this._headRSide);
    this._container.addChild(this._torsoRSide);
    this._container.addChild(this._leftArmRSide);
    this._container.addChild(this._rightArmRSide);
    this._container.addChild(this._leftLegRSide);
    this._container.addChild(this._rightLegRSide);
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

    // FRONT
    this._head.x = -fourPX * tile;
    this._head.y = -sixteenPX * tile;
    this._head.height = eightPX * tile;
    this._head.width = eightPX * tile;

    this._torso.x = -fourPX * tile;
    this._torso.y = -eightPX * tile;
    this._torso.height = twelvePX * tile;
    this._torso.width = eightPX * tile;

    this._leftArm.x = -eightPX * tile;
    this._leftArm.y = -eightPX * tile;
    this._leftArm.height = twelvePX * tile;
    this._leftArm.width = fourPX * tile;
    this._idleArmsYPosition = this._leftArm.y;

    this._rightArm.x = fourPX * tile;
    this._rightArm.y = -eightPX * tile;
    this._rightArm.height = twelvePX * tile;
    this._rightArm.width = fourPX * tile;

    this._leftLeg.x = -fourPX * tile;
    this._leftLeg.y = fourPX * tile;
    this._leftLeg.height = twelvePX * tile;
    this._leftLeg.width = fourPX * tile;

    this._rightLeg.x = 0;
    this._rightLeg.y = fourPX * tile;
    this._rightLeg.height = twelvePX * tile;
    this._rightLeg.width = fourPX * tile;

    // LEFT SIDE
    this._headLSide.x = -fourPX * tile;
    this._headLSide.y = -sixteenPX * tile;
    this._headLSide.height = eightPX * tile;
    this._headLSide.width = eightPX * tile;

    this._torsoLSide.x = -twoPX * tile;
    this._torsoLSide.y = -eightPX * tile;
    this._torsoLSide.height = twelvePX * tile;
    this._torsoLSide.width = fourPX * tile;
    this._torsoLSide.zIndex = 0;

    this._leftArmLSide.x = 0;
    this._leftArmLSide.y = -sixPX * tile;
    this._leftArmLSide.height = twelvePX * tile;
    this._leftArmLSide.width = fourPX * tile;
    this._leftArmLSide.zIndex = 1;
    this._leftArmLSide.anchor.set(0.5, 1 / 6);

    this._rightArmLSide.x = 0;
    this._rightArmLSide.y = -sixPX * tile;
    this._rightArmLSide.height = twelvePX * tile;
    this._rightArmLSide.width = fourPX * tile;
    this._rightArmLSide.zIndex = -1;
    this._rightArmLSide.anchor.set(0.5, 1 / 6);

    this._leftLegLSide.x = 0;
    this._leftLegLSide.y = fourPX * tile;
    this._leftLegLSide.height = twelvePX * tile;
    this._leftLegLSide.width = fourPX * tile;
    this._leftLegLSide.zIndex = 1;
    this._leftLegLSide.anchor.set(0.5, 0);

    this._rightLegLSide.x = 0;
    this._rightLegLSide.y = fourPX * tile;
    this._rightLegLSide.height = twelvePX * tile;
    this._rightLegLSide.width = fourPX * tile;
    this._rightLegLSide.zIndex = -1;
    this._rightLegLSide.anchor.set(0.5, 0);

    // RIGHT SIDE
    this._headRSide.x = -fourPX * tile;
    this._headRSide.y = -sixteenPX * tile;
    this._headRSide.height = eightPX * tile;
    this._headRSide.width = eightPX * tile;

    this._torsoRSide.x = -twoPX * tile;
    this._torsoRSide.y = -eightPX * tile;
    this._torsoRSide.height = twelvePX * tile;
    this._torsoRSide.width = fourPX * tile;
    this._torsoRSide.zIndex = 0;

    this._leftArmRSide.x = 0;
    this._leftArmRSide.y = -sixPX * tile;
    this._leftArmRSide.height = twelvePX * tile;
    this._leftArmRSide.width = fourPX * tile;
    this._leftArmRSide.zIndex = -1;
    this._leftArmRSide.anchor.set(0.5, 1 / 6);

    this._rightArmRSide.x = 0;
    this._rightArmRSide.y = -sixPX * tile;
    this._rightArmRSide.height = twelvePX * tile;
    this._rightArmRSide.width = fourPX * tile;
    this._rightArmRSide.zIndex = 1;
    this._rightArmRSide.anchor.set(0.5, 1 / 6);

    this._leftLegRSide.x = 0;
    this._leftLegRSide.y = fourPX * tile;
    this._leftLegRSide.height = twelvePX * tile;
    this._leftLegRSide.width = fourPX * tile;
    this._leftLegRSide.zIndex = -1;
    this._leftLegRSide.anchor.set(0.5, 0);

    this._rightLegRSide.x = 0;
    this._rightLegRSide.y = fourPX * tile;
    this._rightLegRSide.height = twelvePX * tile;
    this._rightLegRSide.width = fourPX * tile;
    this._rightLegRSide.zIndex = 1;
    this._rightLegRSide.anchor.set(0.5, 0);
  }

  // #################################################
  //   ANIMATIONS
  // #################################################

  setAnimation(animation: string, force = false) {
    if (!force && this._currentAnimation === animation) return;
    this._currentAnimation = animation;

    this._torso.visible = animation === 'idle';
    this._head.visible = animation === 'idle';
    this._leftArm.visible = animation === 'idle';
    this._rightArm.visible = animation === 'idle';
    this._leftLeg.visible = animation === 'idle';
    this._rightLeg.visible = animation === 'idle';

    this._torsoLSide.visible = animation === 'walk_left';
    this._headLSide.visible = animation === 'walk_left';
    this._leftArmLSide.visible = animation === 'walk_left';
    this._rightArmLSide.visible = animation === 'walk_left';
    this._leftLegLSide.visible = animation === 'walk_left';
    this._rightLegLSide.visible = animation === 'walk_left';

    this._torsoRSide.visible = animation === 'walk_right';
    this._headRSide.visible = animation === 'walk_right';
    this._leftArmRSide.visible = animation === 'walk_right';
    this._rightArmRSide.visible = animation === 'walk_right';
    this._leftLegRSide.visible = animation === 'walk_right';
    this._rightLegRSide.visible = animation === 'walk_right';
  }

  #updateAnimations() {
    const time = Date.now();
    const pixelSize = this._global.dimensions.tile / 16;

    // IDLE
    if (this._currentAnimation === 'idle') {
      const idleSin = Math.sin((time / 1000) * this._idleAnimationSpeed);
      this._leftArm.position = new Vector2(
        this._leftArm.x,
        this._idleArmsYPosition + idleSin * this._idleArmsYAmplitude * pixelSize
      );
      this._rightArm.position = new Vector2(
        this._rightArm.x,
        this._idleArmsYPosition + idleSin * this._idleArmsYAmplitude * pixelSize
      );
    }

    // WALK LEFT
    else if (this._currentAnimation === 'walk_left') {
      const walkingSin = Math.sin((time / 1000) * this._walkingAnimationSpeed);
      this._leftArmLSide.rotation = walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
      this._rightArmLSide.rotation = -walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
      this._leftLegLSide.rotation = -walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
      this._rightLegLSide.rotation = walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    }

    // WALK RIGHT
    else if (this._currentAnimation === 'walk_right') {
      const walkingSin = Math.sin((time / 1000) * this._walkingAnimationSpeed);
      this._leftArmRSide.rotation = walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
      this._rightArmRSide.rotation = -walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
      this._leftLegRSide.rotation = -walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
      this._rightLegRSide.rotation = walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    }
  }
}
