import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import Ground from '@game/world/Ground';
import Vector2 from '@util/Vector2';
import { SAFTY_TILES } from '@game/constant/constants';

export interface Layers {
  ground: Ground;
}

export interface RenderArea {
  start: Vector2;
  end: Vector2;
}

export interface WorldProps {
  global: Global;
}

export default class World extends GameClass {
  global: Global;
  container: PIXI.Container;
  layers: Layers;
  characterPosition: Vector2;
  renderArea: RenderArea;

  constructor({ global }: WorldProps) {
    super();
    this.global = global;
    this.container = new PIXI.Container();
    this.global.app.stage.addChild(this.container);

    this.layers = {
      ground: new Ground({ global: this.global }),
    };

    this.characterPosition = new Vector2(0, 0);

    this.renderArea = {
      start: new Vector2(0, 0),
      end: new Vector2(0, 0),
    };
  }

  destructor() {
    for (const value of Object.values(this.layers)) value.destructor();
    this.global.app.stage.removeChild(this.container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    this.#updateRenderArea();
    for (const value of Object.values(this.layers)) value.handleResize(dimensions);
  }

  // #################################################
  //   RENDER AREA
  // #################################################

  handleCharacterPositionChange(position: Vector2) {
    this.characterPosition = position;
    this.#updateRenderArea();
  }

  #updateRenderArea() {
    const { screen, tile } = this.global.dimensions;

    const horizontalNumberOfTiles = Math.ceil(screen.x / tile / 2) + SAFTY_TILES;
    const verticalNumberOfTiles = Math.ceil(screen.y / tile / 2) + SAFTY_TILES;

    this.renderArea = {
      start: new Vector2(
        this.characterPosition.x - horizontalNumberOfTiles,
        this.characterPosition.y - verticalNumberOfTiles
      ),
      end: new Vector2(
        this.characterPosition.x + horizontalNumberOfTiles,
        this.characterPosition.y + verticalNumberOfTiles
      ),
    };

    for (const value of Object.values(this.layers)) value.updateRenderArea(this.renderArea);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    for (const value of Object.values(this.layers)) value.gameLoop(deltaInSeconds);
  }
}
