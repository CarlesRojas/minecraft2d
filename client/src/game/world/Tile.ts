import * as PIXI from 'pixi.js';
import { Dimensions } from '@game/Controller';
import GameClass from '@util/GameClass';
import Vector2 from '@util/Vector2';
import { TileType, getTexture } from '@asset/texture/textures';

export interface TilsProps {
  coords: Vector2;
  container: PIXI.Container;
  dimensions: Dimensions;
}

export default class Tils extends GameClass {
  coords: Vector2;
  sprite: PIXI.Sprite;
  container: PIXI.Container;

  constructor({ coords, container, dimensions }: TilsProps) {
    super();
    this.coords = coords;
    this.container = container;

    this.sprite = new PIXI.Sprite(getTexture(TileType.GRASS));
    this.sprite.anchor.set(0.5);
    this.handleResize(dimensions);

    // TODO remove this condition and check this in the Ground class
    if (this.coords.y > 0) this.container.addChild(this.sprite);
  }

  destructor() {
    this.container.removeChild(this.sprite);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;

    this.sprite.position.set(this.coords.x * tile, this.coords.y * tile);
    this.sprite.width = tile;
    this.sprite.height = tile;
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {}
}
