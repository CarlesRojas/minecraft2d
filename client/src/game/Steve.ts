import CharacterJSON from '@asset/texture/entity/character.json';
import { GRAVITY } from '@game/constant/constants';
import { Dimensions, Global } from '@game/Controller';
import { MouseButton } from '@game/Interaction';
import { getTerrainElevation } from '@game/tool/Noise';
import castRay, { BlockSide, RayCollision } from '@game/tool/Ray';
import { CharacterType, TileType } from '@game/tool/Textures';
import { Interactible, InteractionLayer } from '@util/abstract/Interactible';
import { Mono } from '@util/abstract/Mono';
import Entity from '@util/EntityTypes';
import Timer from '@util/Timer';
import Vector2 from '@util/Vector2';
import { CODE_A, CODE_D, CODE_SPACE } from 'keycode-js';
import * as PIXI from 'pixi.js';
import SpritesManager from './sprite/SpritesManager';

export interface SteveProps {
  global: Global;
}

interface Collision {
  isColliding: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  correction: Vector2;
}

export default class Steve implements Mono {
  // GLOBAL
  private _global: Global;
  private _container: PIXI.Container;

  // SPRITES
  private _spriteContainer: PIXI.Container;
  private _spritesManager: SpritesManager;
  private _hitBoxSprite: PIXI.Sprite;

  // MOVEMENT
  private _position: Vector2 = new Vector2(0, 0);
  private _acceleration = 200;
  private _velocity: Vector2 = new Vector2(0, 0); // Tiles per second
  private _maxVelocity: Vector2 = new Vector2(10, 20); // Tiles per second
  private _isGrounded = false;
  private _jumpingVelocity = 50;
  private _canJump = false;
  private _jumpTimer: Timer;

  // INTERACTION
  private _reachInTiles = 5;
  highlightedInteractible: Interactible | null = null;
  interactedInteractible: Interactible | null = null;

  // DEBUG
  private _debug = true;
  collisionPoint: PIXI.Sprite | null = null;

  constructor({ global }: SteveProps) {
    // GLOBAL
    this._global = global;
    this._container = new PIXI.Container();
    this._global.stage.addChild(this._container);
    this._position = new Vector2(0, getTerrainElevation(0) - 0.5 - CharacterJSON.info.heightInTiles / 2);

    // SPRITES
    this._spriteContainer = new PIXI.Container();
    this._spriteContainer.zIndex = 1;
    this._spriteContainer.sortableChildren = true;
    this._spritesManager = new SpritesManager({
      global,
      container: this._spriteContainer,
      pixel: CharacterJSON.info.heightInTiles * (1 / CharacterJSON.info.heightInPixels), // Total number of height pixels
      texture: CharacterType.PINYA,
      info: CharacterJSON as Entity,
    });
    this._container.addChild(this._spriteContainer);

    this._hitBoxSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this._hitBoxSprite.visible = false;
    this._container.addChild(this._hitBoxSprite);

    this.handleResize(this._global.dimensions);

    // MOVEMENT
    this._jumpTimer = new Timer(0.3, this.#handleJumpTimerFinished.bind(this), {
      startRightAway: false,
      callOnStart: true,
    });

    if (this._debug) {
      this.collisionPoint = new PIXI.Sprite(PIXI.Texture.WHITE);
      this.collisionPoint.tint = 0xff0000;
      this.collisionPoint.width = 8;
      this.collisionPoint.height = 8;
      this.collisionPoint.anchor.set(0.5, 0.5);
      this.collisionPoint.zIndex = 100;
      this.collisionPoint.position.set(0, 0);
      this.collisionPoint.visible = false;
      this._container.addChild(this.collisionPoint);
    }
  }

  destructor() {
    this._spritesManager.destructor();
    this._container.removeChildren();
    this._global.stage.removeChild(this._container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    this._spriteContainer.position.set(this._position.x * tile, this._position.y * tile);

    this._spritesManager.handleResize(dimensions);

    this._hitBoxSprite.position.set(this._position.x * tile, this._position.y * tile);
    this._hitBoxSprite.height = tile * CharacterJSON.info.heightInTiles;
    this._hitBoxSprite.width = tile * CharacterJSON.info.widthInTiles;
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

    this.#changeAnimation();

    this.#checkForInteraction();

    this._spritesManager.gameLoop(deltaInSeconds);
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

    let minX = Math.floor(x - CharacterJSON.info.widthInTiles / 2);
    let maxX = Math.ceil(x + CharacterJSON.info.widthInTiles / 2);
    let minY = Math.floor(y - CharacterJSON.info.heightInTiles / 2);
    let maxY = Math.ceil(y + CharacterJSON.info.heightInTiles / 2);

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

    const tileSprite = this._global.controller.world.ground.elementAtCoords(tileCoords);
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
      width: CharacterJSON.info.widthInTiles,
      height: CharacterJSON.info.heightInTiles,
    };

    const halfPlayerWidth = player.width / 2;
    const halfPlayerHeight = player.height / 2;
    const halfWidthInTiles = tile.width / 2;
    const halfHeightInTiles = tile.height / 2;

    const collides =
      player.x - halfPlayerWidth < tile.x + halfWidthInTiles &&
      player.x + halfPlayerWidth > tile.x - halfWidthInTiles &&
      player.y - halfPlayerHeight < tile.y + halfHeightInTiles &&
      player.y + halfPlayerHeight > tile.y - halfHeightInTiles;

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

  #changeAnimation() {
    const leftButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_A);
    const rightButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_D);

    if (leftButtonClicked) this._spritesManager.setAnimation('walk_left');
    else if (rightButtonClicked) this._spritesManager.setAnimation('walk_right');
    else this._spritesManager.setAnimation('idle');
  }

  // #################################################
  //   INTERACT
  // #################################################

  #checkForInteraction() {
    const origin = this._position;
    const mousePosition = this._global.controller.interaction.mousePositionInTiles;
    const direction = Vector2.direction(origin, mousePosition);
    const layers = [InteractionLayer.GROUND];
    const collision = castRay(origin, direction, this._reachInTiles, layers, this._global);

    this.#moveCollisionPoint(collision);
    this.#interact(collision);
    this.#highlight(collision);
    this.#interactSecondary(collision);
  }

  #interact(collision: RayCollision | false) {
    const interactButtonClicked = this._global.controller.interaction.isKeyPressed(MouseButton.LEFT);

    if (interactButtonClicked && collision) {
      if (collision.interactible !== this.interactedInteractible) {
        this.interactedInteractible?.stopInteracting();
        collision.interactible.interact();
        this.interactedInteractible = collision.interactible;
      }
    } else {
      this.interactedInteractible?.stopInteracting();
      this.interactedInteractible = null;
    }
  }

  #highlight(collision: RayCollision | false) {
    if (collision) {
      if (collision.interactible !== this.highlightedInteractible) {
        this.highlightedInteractible?.stopHighlighting();
        collision.interactible.highlight();
        this.highlightedInteractible = collision.interactible;
      }
    } else {
      this.highlightedInteractible?.stopHighlighting();
      this.highlightedInteractible = null;
    }
  }

  #interactSecondary(collision: RayCollision | false) {
    const interactSecondaryButtonClicked = this._global.controller.interaction.isKeyFirstPressed(MouseButton.RIGHT);

    if (interactSecondaryButtonClicked && collision) {
      const { blockSide, coords } = collision;

      if (blockSide === BlockSide.LEFT) coords.x -= 1;
      else if (blockSide === BlockSide.RIGHT) coords.x += 1;
      else if (blockSide === BlockSide.TOP) coords.y -= 1;
      else if (blockSide === BlockSide.BOTTOM) coords.y += 1;
      else return;

      this._global.controller.world.ground.elementAtCoords(coords)?.interactSecondary();
    }
  }

  #moveCollisionPoint(collision: RayCollision | false) {
    if (!this.collisionPoint) return;
    const { tile } = this._global.dimensions;
    this.collisionPoint.visible = !!collision;
    if (collision && collision.point)
      this.collisionPoint.position.set(collision.point.x * tile, collision.point.y * tile);
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
