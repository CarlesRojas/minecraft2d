import * as PIXI from 'pixi.js';
import { Child, Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { CharacterType, getCharacterTexture, getTileTexture } from '@game/tools/Textures';
import Vector2 from '@util/Vector2';

export interface CharacterProps {
  global: Global;
  dimensions: Dimensions;
}

export default class Character extends GameClass {
  private _global: Global;
  private _sprite: PIXI.Sprite;
  private _container: PIXI.Container;

  private _position: Vector2 = new Vector2(0, 0);
  private _movementSpeed = 10; // Tiles per second

  constructor({ global, dimensions }: CharacterProps) {
    super();
    this._global = global;
    this._container = new PIXI.Container();
    this._global.app.stage.addChild(this._container);

    this._sprite = new PIXI.Sprite(getCharacterTexture(CharacterType.STEVE));
    this._sprite.zIndex = 1;
    this._sprite.anchor.set(0.5);
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
    this._sprite.width = tile;
    this._sprite.height = tile;
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.#moveCharacter(deltaInSeconds);
  }

  #moveCharacter(deltaInSeconds: number) {
    if (this._global.controller.interaction.isKeyPressed('w')) {
      this._position.y -= this._movementSpeed * deltaInSeconds;
    }

    if (this._global.controller.interaction.isKeyPressed('a')) {
      this._position.x -= this._movementSpeed * deltaInSeconds;
    }

    if (this._global.controller.interaction.isKeyPressed('s')) {
      this._position.y += this._movementSpeed * deltaInSeconds;
    }

    if (this._global.controller.interaction.isKeyPressed('d')) {
      this._position.x += this._movementSpeed * deltaInSeconds;
    }

    this.#moveCharacterToPosition(this._position);
  }

  #moveCharacterToPosition(position: Vector2) {
    const tileSize = this._global.dimensions.tile;
    this._sprite.position.set(position.x * tileSize, position.y * tileSize);
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
