import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { CharacterType, getCharacterTexture } from '@game/tools/Textures';
import Vector2 from '@util/Vector2';
import { getTerrainElevation } from '@game/tools/Noise';
import { GRAVITY } from '@game/constant/constants';
import { Event } from '@util/Events';
import { CODE_A, CODE_D, CODE_SPACE } from 'keycode-js';

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

export default class Character extends GameClass {
  private _global: Global;
  private _sprite: PIXI.Sprite;
  private _container: PIXI.Container;

  // MOVEMENT
  private _position: Vector2 = new Vector2(0, 0);
  private _acceleration = 200;
  private _velocity: Vector2 = new Vector2(0, 0); // Tiles per second
  private _maxVelocity: Vector2 = new Vector2(10, 20); // Tiles per second
  private _isGrounded = false;
  private _isJumping = false;
  private _jumpingVelocity = 50;

  // TODO create transparent sprite just for the bounds

  constructor({ global, dimensions }: CharacterProps) {
    super();
    this._global = global;
    this._container = new PIXI.Container();
    this._global.app.stage.addChild(this._container);
    this._position = new Vector2(0, getTerrainElevation(0) - 2);

    this._sprite = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE));
    this._sprite.zIndex = 1;
    this.handleResize(dimensions);

    this._container.addChild(this._sprite);
  }

  destructor() {
    if (this._sprite) this._container.removeChild(this._sprite);
    this._global.app.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    this._sprite.position.set(this._position.x * tile, this._position.y * tile);
    this._sprite.height = tile * 1.8;
    this._sprite.width = tile * 0.9;
    this._sprite.anchor.set(0.5, 0.5);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
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
    if (jumbButtonClicked && !this._isJumping && this._isGrounded) {
      this._isJumping = true;
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

    // // GRAVITY
    console.log(this._isGrounded);
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

    if (this._isGrounded) {
      this._velocity.y = 0;
      this._isJumping = false;
    }
  }

  #moveCharacterToPosition(position: Vector2) {
    this._position.x = position.x;
    this._position.y = position.y;
    const tileSize = this._global.dimensions.tile;
    this._sprite.position.set(position.x * tileSize, position.y * tileSize);
  }

  #isCollidingWithEnviroment(deltaPosition: Vector2) {
    const x = this._position.x + deltaPosition.x;
    const y = this._position.y + deltaPosition.y;

    let minX = Math.floor(x);
    let maxX = Math.ceil(x);
    let minY = Math.floor(y);
    let maxY = Math.ceil(y);

    if (minX === maxX) {
      minX -= 1;
      maxX += 1;
    }

    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }

    for (let i = minX; i <= maxX; i++)
      for (let j = minY; j <= maxY; j++) {
        const collision = this.#isCollidingWithTile(new Vector2(i, j), deltaPosition);
        if (collision.isColliding) return collision;
      }

    return false;
  }

  #isCollidingWithTile(tileCoords: Vector2, deltaPosition: Vector2) {
    const tileSize = this._global.dimensions.tile;
    const playerBounds = this._sprite.getBounds();
    const playerBox = {
      ...playerBounds,
      x: playerBounds.x + deltaPosition.x * tileSize,
      y: playerBounds.y + deltaPosition.y * tileSize,
    };
    const tile = this._global.controller.world.ground.tileAtCoords(tileCoords);
    const tileBox = tile?.bounds;

    const noCollision: Collision = {
      isColliding: false,
      left: false,
      right: false,
      top: false,
      bottom: false,
      correction: new Vector2(0, 0),
    };

    if (!tileBox) return noCollision;

    const collides =
      playerBox.x < tileBox.x + tileBox.width &&
      playerBox.x + playerBox.width > tileBox.x &&
      playerBox.y < tileBox.y + tileBox.height &&
      playerBox.y + playerBox.height > tileBox.y;

    if (!collides) return noCollision;

    const playerCenter = new Vector2(playerBox.x + playerBox.width / 2, playerBox.y + playerBox.height / 2);
    const tileCenter = new Vector2(tileBox.x + tileBox.width / 2, tileBox.y + tileBox.height / 2);

    const horizontal = playerCenter.x - tileCenter.x;
    const vertical = playerCenter.y - tileCenter.y;

    const left = horizontal > 0;
    const right = horizontal < 0;
    const top = vertical > 0;
    const bottom = vertical < 0;

    const playerWidthInTiles = playerBox.width / tileSize;
    const playerHeightInTiles = playerBox.height / tileSize;
    const leftCorrection = tileCoords.x + 0.5 + playerWidthInTiles / 2;
    const rightCorrection = tileCoords.x - 0.5 - playerWidthInTiles / 2;
    const topCorrection = tileCoords.y + 0.5 + playerHeightInTiles / 2;
    const bottomCorrection = tileCoords.y - 0.5 - playerHeightInTiles / 2;

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
  //   GETTERS
  // #################################################

  get position() {
    return this._position;
  }

  get roundedPosition() {
    return new Vector2(Math.round(this._position.x), Math.round(this._position.y));
  }
}
