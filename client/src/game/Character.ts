import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { CharacterType, getCharacterTexture, TileType } from '@game/tools/Textures';
import Vector2 from '@util/Vector2';
import { getTerrainElevation } from '@game/tools/Noise';
import { GRAVITY } from '@game/constant/constants';
import { Event } from '@util/Events';
import { CODE_A, CODE_D, CODE_S, CODE_SPACE, CODE_W } from 'keycode-js';
import Timer from '@util/Timer';

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

const HEIGHT = 1.8;
const WIDTH = 0.6;

export default class Character extends GameClass {
  private _global: Global;
  private _sprite: PIXI.Sprite;
  private _hitBoxSprite: PIXI.Sprite;
  private _container: PIXI.Container;

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
    this._global = global;
    this._container = new PIXI.Container();
    this._global.app.stage.addChild(this._container);
    this._position = new Vector2(0, getTerrainElevation(0) - 0.5 - HEIGHT / 2);

    this._sprite = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE));
    this._sprite.zIndex = 1;

    this._hitBoxSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    this._hitBoxSprite.visible = false;
    this.handleResize(dimensions);

    this._container.addChild(this._sprite);
    this._container.addChild(this._hitBoxSprite);

    this._jumpTimer = new Timer(0.3, this.#handleJumpTimerFinished.bind(this), {
      startRightAway: false,
      callOnStart: true,
    });
  }

  destructor() {
    if (this._sprite) this._container.removeChild(this._sprite);
    if (this._hitBoxSprite) this._container.removeChild(this._hitBoxSprite);
    this._global.app.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    this._sprite.position.set(this._position.x * tile, this._position.y * tile);
    this._sprite.height = tile * HEIGHT;
    this._sprite.width = tile * (HEIGHT / 2);
    this._sprite.anchor.set(0.5, 0.5);

    this._hitBoxSprite.position.set(this._position.x * tile, this._position.y * tile);
    this._hitBoxSprite.height = tile * HEIGHT;
    this._hitBoxSprite.width = tile * WIDTH;
    this._hitBoxSprite.anchor.set(0.5, 0.5);
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
  }

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
    this._sprite.position.set(position.x * tileSize, position.y * tileSize);
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

  #handleJumpTimerFinished() {
    this._canJump = true;
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
