import PlayerJson from '@asset/json/entity/player.json';
import { GRAVITY } from '@game/constant/constants';
import { Dimensions, Global } from '@game/Controller';
import { CollisionLayer, Interactible, InteractionLayer } from '@game/interface/Interactible';
import { Mono } from '@game/interface/Mono';
import { MouseButton } from '@game/layer/interaction/Interaction';
import { getMovementAfterCollisions } from '@game/system/Collision';
import { getTerrainElevation } from '@game/system/Noise';
import castRay, { BlockSide, RayCollision } from '@game/system/Ray';
import SpritesManager from '@game/system/SpritesManager';
import { EntityType } from '@game/system/Textures';
import Entity, { Bounds } from '@game/util/EntityTypes';
import Timer from '@game/util/Timer';
import Vector2 from '@game/util/Vector2';
import { CODE_A, CODE_D, CODE_SPACE } from 'keycode-js';
import * as PIXI from 'pixi.js';

interface PlayerProps {
  global: Global;
}

export default class Player implements Mono, Interactible {
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

  // LAYERS
  interactionLayer: InteractionLayer = InteractionLayer.PLAYER;
  collisionLayer: CollisionLayer = CollisionLayer.PLAYER;

  // INTERACTION
  private _reachInTiles = 5;
  highlightedInteractible: Interactible | null = null;
  interactedInteractible: Interactible | null = null;

  // DEBUG
  private _debug = false;
  collisionPoint: PIXI.Sprite | null = null;

  constructor({ global }: PlayerProps) {
    // GLOBAL
    this._global = global;
    this._container = new PIXI.Container();
    this._global.stage.addChild(this._container);
    this._position = new Vector2(0, getTerrainElevation(0) - 1 - PlayerJson.info.heightInTiles / 2);

    // SPRITES
    this._spriteContainer = new PIXI.Container();
    this._spriteContainer.zIndex = 1;
    this._spriteContainer.sortableChildren = true;
    this._spritesManager = new SpritesManager({
      global,
      container: this._spriteContainer,
      pixel: PlayerJson.info.heightInTiles * (1 / PlayerJson.info.heightInPixels), // Total number of height pixels
      texture: EntityType.STEVE,
      info: PlayerJson as Entity,
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

    this._spriteContainer.position.set(this.position.x * tile, this.position.y * tile);

    this._spritesManager.handleResize(dimensions);

    this._hitBoxSprite.position.set(this.position.x * tile, this.position.y * tile);
    this._hitBoxSprite.height = tile * PlayerJson.info.heightInTiles;
    this._hitBoxSprite.width = tile * PlayerJson.info.widthInTiles;
    this._hitBoxSprite.anchor.set(0.5, 0.5);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this._jumpTimer.gameLoop(deltaInSeconds);

    this.#updatePlayerSpeed(deltaInSeconds);
    this.#applyMovement(deltaInSeconds);
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

  #applyMovement(deltaInSeconds: number) {
    const finalMovement = getMovementAfterCollisions({
      position: this._position,
      velocity: this._velocity,
      sizeInTiles: new Vector2(PlayerJson.info.widthInTiles, PlayerJson.info.heightInTiles),
      layers: [CollisionLayer.GROUND],
      deltaInSeconds,
      global: this._global,
      isGrounded: this._isGrounded,
    });

    const { position, velocity, isGrounded } = finalMovement;
    this._velocity = velocity;
    this._isGrounded = isGrounded;
    this.#moveToPosition(position);
  }

  #moveToPosition(position: Vector2) {
    this._position.x = position.x;
    this._position.y = position.y;
    const tileSize = this._global.dimensions.tile;
    this._spriteContainer.position.set(position.x * tileSize, position.y * tileSize);
    this._hitBoxSprite.position.set(position.x * tileSize, position.y * tileSize);
  }

  #changeAnimation() {
    const leftButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_A);
    const rightButtonClicked = this._global.controller.interaction.isKeyPressed(CODE_D);

    if (leftButtonClicked) this._spritesManager.setAnimation('walk_left');
    else if (rightButtonClicked) this._spritesManager.setAnimation('walk_right');
    else this._spritesManager.setAnimation('idle');
  }

  #handleJumpTimerFinished() {
    this._canJump = true;
  }

  // #################################################
  //   INTERACT
  // #################################################

  #checkForInteraction() {
    const origin = this.facePosition;
    const mousePosition = this._global.controller.interaction.mousePositionInTiles;

    if (!mousePosition) {
      this.#moveCollisionPoint(false);
      this.#interact(false);
      this.#highlight(false);
      this.#interactSecondary(false);
      return;
    }

    const direction = Vector2.direction(origin, mousePosition);
    const layers = [InteractionLayer.GROUND];
    const collision = castRay(origin, direction, this._reachInTiles, layers, this._global);

    this.#moveCollisionPoint(collision);
    this.#highlight(collision);

    // TODO Do one or the other depending on the type of block in the player hand
    this.#interact(collision);
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
  //   INTERACTION INTERFACE
  // #################################################

  highlight() {}
  stopHighlighting() {}
  interact() {}
  stopInteracting() {}
  interactSecondary() {}
  shouldCollide() {
    return true;
  }

  get bounds() {
    const bounds: Bounds = {
      x: this._position.x - PlayerJson.info.widthInTiles / 2,
      y: this._position.y - PlayerJson.info.heightInTiles / 2,
      width: PlayerJson.info.widthInTiles,
      height: PlayerJson.info.heightInTiles,
    };

    return bounds;
  }

  // #################################################
  //   GETTERS
  // #################################################

  get position() {
    return this._position;
  }

  get facePosition() {
    return new Vector2(this._position.x, this._position.y - PlayerJson.info.heightInTiles / 4);
  }

  get roundedPosition() {
    return new Vector2(Math.round(this._position.x), Math.round(this._position.y));
  }
}
