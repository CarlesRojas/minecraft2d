import { GRAVITY } from '@game/constant/constants';
import { Dimensions, Global } from '@game/Controller';
import { getTerrainElevation } from '@game/tools/Noise';
import { CharacterType, getCharacterTexture, TileType } from '@game/tools/Textures';
import GameClass from '@util/GameClass';
import Timer from '@util/Timer';
import Vector2 from '@util/Vector2';
import { CODE_A, CODE_D, CODE_SPACE } from 'keycode-js';
import * as PIXI from 'pixi.js';

export interface CharacterProps {
  global: Global;
  dimensions: Dimensions;
}

interface Collision {
  isColliding: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  correction: Vector2;
}

enum Animation {
  IDLE,
  WALK_RIGHT,
  WALK_LEFT,
  JUMP,
}

const HEIGHT = 1.8;
const WIDTH = 0.6;

export default class Character extends GameClass {
  // GLOBAL
  private _global: Global;
  private _container: PIXI.Container;

  // SPRITES
  private _spriteContainer: PIXI.Container;
  private _hitBoxSprite: PIXI.Sprite;

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
  private _currentAnimation: Animation = Animation.IDLE;

  private _idleAnimationSpeed = 4; // Seconds per cycle
  private _idleArmsYPosition = 0; // Seconds per cycle
  private _idleArmsYAmplitude = 0.5; // Amplitude of animation in texture px

  private _walkingAnimationSpeed = 6; // Seconds per cycle
  private _walkingArmsYAmplitude = 30; // Amplitude of animation in degrees
  private _walkingLegsYAmplitude = 35;

  // MOVEMENT
  private _position: Vector2 = new Vector2(0, 0);
  private _acceleration = 200;
  private _velocity: Vector2 = new Vector2(0, 0); // Tiles per second
  private _maxVelocity: Vector2 = new Vector2(10, 20); // Tiles per second
  private _isGrounded = false;
  private _jumpingVelocity = 50;
  private _canJump = false;
  private _jumpTimer: Timer;

  constructor({ global, dimensions }: CharacterProps) {
    super();

    // GLOBAL
    this._global = global;
    this._container = new PIXI.Container();
    this._global.app.stage.addChild(this._container);
    this._position = new Vector2(0, getTerrainElevation(0) - 0.5 - HEIGHT / 2);

    // SPRITES
    this._head = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(8, 8, 8, 8)));
    this._torso = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(20, 20, 8, 12)));
    this._leftArm = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(44, 20, 4, 12)));
    this._rightArm = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(36, 52, 4, 12)));
    this._leftLeg = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(4, 20, 4, 12)));
    this._rightLeg = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(20, 52, 4, 12)));

    this._headLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(12, 8, 8, 8)));
    this._torsoLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(28, 20, 4, 12)));
    this._leftArmLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(48, 20, 4, 12)));
    this._rightArmLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(40, 52, 4, 12)));
    this._leftLegLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(8, 20, 4, 12)));
    this._rightLegLSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(24, 52, 4, 12)));

    this._headRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(4, 8, 8, 8)));
    this._torsoRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(16, 20, 4, 12)));
    this._leftArmRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(40, 20, 4, 12)));
    this._rightArmRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(32, 52, 4, 12)));
    this._leftLegRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(0, 20, 4, 12)));
    this._rightLegRSide = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE, new PIXI.Rectangle(16, 52, 4, 12)));

    this._spriteContainer = new PIXI.Container();
    this._spriteContainer.zIndex = 1;
    this._spriteContainer.sortableChildren = true;

    this._spriteContainer.addChild(this._head);
    this._spriteContainer.addChild(this._torso);
    this._spriteContainer.addChild(this._leftArm);
    this._spriteContainer.addChild(this._rightArm);
    this._spriteContainer.addChild(this._leftLeg);
    this._spriteContainer.addChild(this._rightLeg);

    this._spriteContainer.addChild(this._headLSide);
    this._spriteContainer.addChild(this._torsoLSide);
    this._spriteContainer.addChild(this._leftArmLSide);
    this._spriteContainer.addChild(this._rightArmLSide);
    this._spriteContainer.addChild(this._leftLegLSide);
    this._spriteContainer.addChild(this._rightLegLSide);

    this._spriteContainer.addChild(this._headRSide);
    this._spriteContainer.addChild(this._torsoRSide);
    this._spriteContainer.addChild(this._leftArmRSide);
    this._spriteContainer.addChild(this._rightArmRSide);
    this._spriteContainer.addChild(this._leftLegRSide);
    this._spriteContainer.addChild(this._rightLegRSide);

    this._container.addChild(this._spriteContainer);

    // TODO do this on the fly when the character changes action
    this.#showAnimation(Animation.WALK_LEFT);

    this._hitBoxSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this._hitBoxSprite.visible = false;
    this._container.addChild(this._hitBoxSprite);

    this.handleResize(dimensions);

    // MOVEMENT
    this._jumpTimer = new Timer(0.3, this.#handleJumpTimerFinished.bind(this), {
      startRightAway: false,
      callOnStart: true,
    });
  }

  destructor() {
    if (this._spriteContainer) {
      this._spriteContainer.removeChildren();
      this._container.removeChild(this._spriteContainer);
    }
    if (this._hitBoxSprite) this._container.removeChild(this._hitBoxSprite);
    this._global.app.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    this._spriteContainer.position.set(this._position.x * tile, this._position.y * tile);

    this.#positionSprites(tile);

    this._hitBoxSprite.position.set(this._position.x * tile, this._position.y * tile);
    this._hitBoxSprite.height = tile * HEIGHT;
    this._hitBoxSprite.width = tile * WIDTH;
    this._hitBoxSprite.anchor.set(0.5, 0.5);
  }

  #positionSprites(tile: number) {
    const twoPX = HEIGHT * 0.125 * 0.5;
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
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this._jumpTimer.gameLoop(deltaInSeconds);
    this.#updatePlayerSpeed(deltaInSeconds);

    this.#applyHorizontalMovement(deltaInSeconds);
    this.#applyVerticalMovement(deltaInSeconds);
    this.#checkIfGrounded();

    this.#updateAnimations(deltaInSeconds);
  }

  // #################################################
  //   MOVEMENT
  // #################################################

  #updatePlayerSpeed(deltaInSeconds: number) {
    const jumbButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_SPACE);
    const leftButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_A);
    const rightButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_D);

    // JUMP
    if (jumbButtonClicked && this._canJump && this._isGrounded) {
      this._canJump = false;
      this._jumpTimer.reset();
      this._isGrounded = false;
      this._velocity.y = -this._jumpingVelocity;
    }

    // MOVEMENT
    if (leftButtonClicked) this._velocity.x -= this._acceleration * deltaInSeconds;
    if (rightButtonClicked) this._velocity.x += this._acceleration * deltaInSeconds;

    // FRICTION
    if (!leftButtonClicked && !rightButtonClicked) {
      if (this._velocity.x > 0) this._velocity.x = Math.max(this._velocity.x - this._acceleration * deltaInSeconds, 0);
      if (this._velocity.x < 0) this._velocity.x = Math.min(this._velocity.x + this._acceleration * deltaInSeconds, 0);
    }

    // GRAVITY
    if (!this._isGrounded) this._velocity.y = this._velocity.y += GRAVITY * deltaInSeconds;

    // MAX VELOCITY
    this._velocity.x = Math.max(Math.min(this._velocity.x, this._maxVelocity.x), -this._maxVelocity.x);
    this._velocity.y = Math.max(Math.min(this._velocity.y, this._maxVelocity.y), -this._maxVelocity.y);
  }

  #applyVerticalMovement(deltaInSeconds: number) {
    const velocity = this._velocity.y;
    if (velocity === 0) return;
    const deltaPosition = new Vector2(0, velocity * deltaInSeconds);

    const collision = this.#isCollidingWithEnviroment(deltaPosition);
    if (collision && collision.isColliding) {
      this._velocity.y = 0;
      this.#moveCharacterToPosition(new Vector2(this._position.x, collision.correction.y));
    } else this.#moveCharacterToPosition(new Vector2(this._position.x, this._position.y + velocity * deltaInSeconds));
  }

  #applyHorizontalMovement(deltaInSeconds: number) {
    const velocity = this._velocity.x;
    if (velocity === 0) return;
    const deltaPosition = new Vector2(velocity * deltaInSeconds, 0);

    const collision = this.#isCollidingWithEnviroment(deltaPosition);
    if (collision && collision.isColliding) {
      this._velocity.x = 0;
      this.#moveCharacterToPosition(new Vector2(collision.correction.x, this._position.y));
    } else this.#moveCharacterToPosition(new Vector2(this._position.x + velocity * deltaInSeconds, this._position.y));
  }

  #handleJumpTimerFinished() {
    this._canJump = true;
  }

  // #################################################
  //   COLLISIONS
  // #################################################

  #checkIfGrounded() {
    const deltaPosition = new Vector2(0, 0.1);

    const collision = this.#isCollidingWithEnviroment(deltaPosition);
    this._isGrounded = collision && collision.isColliding;

    if (this._isGrounded) this._velocity.y = 0;
  }

  #moveCharacterToPosition(position: Vector2) {
    this._position.x = position.x;
    this._position.y = position.y;
    const tileSize = this._global.dimensions.tile;
    this._spriteContainer.position.set(position.x * tileSize, position.y * tileSize);
    this._hitBoxSprite.position.set(position.x * tileSize, position.y * tileSize);
  }

  #isCollidingWithEnviroment(deltaPosition: Vector2) {
    const x = this._position.x + deltaPosition.x;
    const y = this._position.y + deltaPosition.y;

    let minX = Math.floor(x - WIDTH / 2);
    let maxX = Math.ceil(x + WIDTH / 2);
    let minY = Math.floor(y - HEIGHT / 2);
    let maxY = Math.ceil(y + HEIGHT / 2);

    for (let i = minX; i <= maxX; i++)
      for (let j = minY; j <= maxY; j++) {
        const collision = this.#isCollidingWithTile(new Vector2(i, j), deltaPosition);
        if (collision.isColliding) return collision;
      }

    return false;
  }

  #isCollidingWithTile(tileCoords: Vector2, deltaPosition: Vector2) {
    const noCollision: Collision = {
      isColliding: false,
      left: false,
      right: false,
      top: false,
      bottom: false,
      correction: new Vector2(0, 0),
    };

    const tileSprite = this._global.controller.world.ground.tileAtCoords(tileCoords);
    if (!tileSprite || tileSprite.type === TileType.NONE) return noCollision;

    const tile = {
      x: tileCoords.x,
      y: tileCoords.y,
      width: 1,
      height: 1,
    };

    const player = {
      x: this._position.x + deltaPosition.x,
      y: this._position.y + deltaPosition.y,
      width: WIDTH,
      height: HEIGHT,
    };

    const halfPlayerWidth = player.width / 2;
    const halfPlayerHeight = player.height / 2;
    const halfTileWidth = tile.width / 2;
    const halfTileHeight = tile.height / 2;

    const collides =
      player.x - halfPlayerWidth < tile.x + halfTileWidth &&
      player.x + halfPlayerWidth > tile.x - halfTileWidth &&
      player.y - halfPlayerHeight < tile.y + halfTileHeight &&
      player.y + halfPlayerHeight > tile.y - halfTileHeight;

    if (!collides) return noCollision;

    const horizontal = player.x - tile.x;
    const vertical = player.y - tile.y;

    const left = horizontal > 0;
    const right = horizontal < 0;
    const top = vertical > 0;
    const bottom = vertical < 0;

    const leftCorrection = tile.x + 0.5 + halfPlayerWidth;
    const rightCorrection = tile.x - 0.5 - halfPlayerWidth;
    const topCorrection = tile.y + 0.5 + halfPlayerHeight;
    const bottomCorrection = tile.y - 0.5 - halfPlayerHeight;

    return {
      isColliding: true,
      left,
      right,
      top,
      bottom,
      correction: new Vector2(left ? leftCorrection : rightCorrection, top ? topCorrection : bottomCorrection),
    } as Collision;
  }

  // #################################################
  //   ANIMATIONS
  // #################################################

  #updateAnimations(deltaInSeconds: number) {
    const time = Date.now();
    const pixelSize = this._global.dimensions.tile / 16;

    // IDLE
    const idleSin = Math.sin((time / 1000) * this._idleAnimationSpeed);
    this._leftArm.position = new Vector2(
      this._leftArm.x,
      this._idleArmsYPosition + idleSin * this._idleArmsYAmplitude * pixelSize
    );
    this._rightArm.position = new Vector2(
      this._rightArm.x,
      this._idleArmsYPosition + idleSin * this._idleArmsYAmplitude * pixelSize
    );

    // WALK
    const walkingSin = Math.sin((time / 1000) * this._walkingAnimationSpeed);
    this._leftArmLSide.rotation = walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    this._rightArmLSide.rotation = -walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    this._leftLegLSide.rotation = -walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    this._rightLegLSide.rotation = walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);

    this._leftArmRSide.rotation = walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    this._rightArmRSide.rotation = -walkingSin * this._walkingArmsYAmplitude * (Math.PI / 180);
    this._leftLegRSide.rotation = -walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);
    this._rightLegRSide.rotation = walkingSin * this._walkingLegsYAmplitude * (Math.PI / 180);

    // SHOW CORRECT SPRITES
    const leftButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_A);
    const rightButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_D);

    if (rightButtonClicked) this.#showAnimation(Animation.WALK_RIGHT);
    else if (leftButtonClicked) this.#showAnimation(Animation.WALK_LEFT);
    else this.#showAnimation(Animation.IDLE);
  }

  #showAnimation(animation: Animation) {
    if (this._currentAnimation === animation) return;
    this._currentAnimation = animation;

    this._torso.visible = animation === Animation.IDLE;
    this._head.visible = animation === Animation.IDLE;
    this._leftArm.visible = animation === Animation.IDLE;
    this._rightArm.visible = animation === Animation.IDLE;
    this._leftLeg.visible = animation === Animation.IDLE;
    this._rightLeg.visible = animation === Animation.IDLE;

    this._torsoLSide.visible = animation === Animation.WALK_LEFT;
    this._headLSide.visible = animation === Animation.WALK_LEFT;
    this._leftArmLSide.visible = animation === Animation.WALK_LEFT;
    this._rightArmLSide.visible = animation === Animation.WALK_LEFT;
    this._leftLegLSide.visible = animation === Animation.WALK_LEFT;
    this._rightLegLSide.visible = animation === Animation.WALK_LEFT;

    this._torsoRSide.visible = animation === Animation.WALK_RIGHT;
    this._headRSide.visible = animation === Animation.WALK_RIGHT;
    this._leftArmRSide.visible = animation === Animation.WALK_RIGHT;
    this._rightArmRSide.visible = animation === Animation.WALK_RIGHT;
    this._leftLegRSide.visible = animation === Animation.WALK_RIGHT;
    this._rightLegRSide.visible = animation === Animation.WALK_RIGHT;
  }

  // #################################################
  //   GETTERS
  // #################################################

  get position() {
    return this._position;
  }

  get roundedPosition() {
    return new Vector2(Math.round(this._position.x), Math.round(this._position.y));
  }
}
