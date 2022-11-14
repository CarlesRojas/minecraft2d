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

export default class Character extends GameClass {
  private _global: Global;
  private _sprite: PIXI.Sprite;
  private _container: PIXI.Container;

  // MOVEMENT
  private _position: Vector2 = new Vector2(0, 0);
  private _acceleration = 200;
  private _velocity: Vector2 = new Vector2(0, 0); // Tiles per second
  private _maxVelocity: Vector2 = new Vector2(10, 20); // Tiles per second
  private _isGrounded = true;
  private _isJumping = false;
  private _jumpingVelocity = 50;

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
    this._sprite.height = tile * 1.9;
    this._sprite.width = tile * 0.95;
    this._sprite.anchor.set(0.5, 0.75);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.#updatePlayerSpeed(deltaInSeconds);

    this.#applyVerticalMovement(deltaInSeconds);
    this.#applyHorizontalMovement(deltaInSeconds);
  }

  #updatePlayerSpeed(deltaInSeconds: number) {
    const jumbButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_SPACE);
    const leftButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_A);
    const rightButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_D);

    // JUMP
    if (jumbButtonClicked && !this._isJumping) {
      this._isJumping = true;
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
    this._velocity.y = this._velocity.y += GRAVITY * deltaInSeconds;

    // MAX VELOCITY
    this._velocity.x = Math.max(Math.min(this._velocity.x, this._maxVelocity.x), -this._maxVelocity.x);
    this._velocity.y = Math.max(Math.min(this._velocity.y, this._maxVelocity.y), -this._maxVelocity.y);
  }

  #applyVerticalMovement(deltaInSeconds: number) {
    const velocity = this._velocity.y;
    const prevPosition = this._position.clone();
    const newPosition = new Vector2(this._position.x, this._position.y + velocity * deltaInSeconds);
    this.#moveCharacterToPosition(newPosition);

    if (this.#isCollidingWithEnviroment()) {
      this._isJumping = false;
      this._velocity.y = 0;
      this.#moveCharacterToPosition(prevPosition);
    }
  }

  #applyHorizontalMovement(deltaInSeconds: number) {
    const velocity = this._velocity.x;
    const prevPosition = this._position.clone();
    const newPosition = new Vector2(this._position.x + velocity * deltaInSeconds, this._position.y);
    this.#moveCharacterToPosition(newPosition);

    if (this.#isCollidingWithEnviroment()) {
      this._velocity.x = 0;
      this.#moveCharacterToPosition(prevPosition);
    }
  }

  #moveCharacterToPosition(position: Vector2) {
    this._position.x = position.x;
    this._position.y = position.y;
    const tileSize = this._global.dimensions.tile;
    this._sprite.position.set(position.x * tileSize, position.y * tileSize);
  }

  #isCollidingWithEnviroment() {
    const { x, y } = this.position;
    const minX = Math.floor(x);
    const maxX = Math.ceil(x);
    const minY = Math.floor(y);
    const maxY = Math.ceil(y);

    for (let i = minX; i <= maxX; i++)
      for (let j = minY; j <= maxY; j++) if (this.#isCollidingWithTile(new Vector2(i, j))) return true;
  }

  #isCollidingWithTile(tileCoords: Vector2) {
    const playerBox = this._sprite.getBounds();
    const tile = this._global.controller.world.ground.tileAtCoords(tileCoords);
    const tileBox = tile?.bounds;

    if (!tileBox) return false;

    return (
      playerBox.x < tileBox.x + tileBox.width &&
      playerBox.x + playerBox.width > tileBox.x &&
      playerBox.y < tileBox.y + tileBox.height &&
      playerBox.y + playerBox.height > tileBox.y
    );
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
