import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { RenderArea } from '@game/world/World';
import Tile from '@game/world/Tile';
import Vector2 from '@util/Vector2';

export interface GroundProps {
  global: Global;
}

export default class Ground extends GameClass {
  global: Global;
  container: PIXI.Container;
  renderedTiles: { [key: string]: Tile };

  constructor({ global }: GroundProps) {
    super();
    this.global = global;

    this.container = new PIXI.Container();
    this.global.app.stage.addChild(this.container);

    this.renderedTiles = {};
  }

  destructor() {
    for (const tile of Object.values(this.renderedTiles)) tile.destructor();
    this.global.app.stage.removeChild(this.container);
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    for (const tile of Object.values(this.renderedTiles)) tile.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    for (const tile of Object.values(this.renderedTiles)) tile.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   RENDER AREA
  // #################################################

  updateRenderArea(renderArea: RenderArea) {
    const { start, end } = renderArea;
    const { x: startX, y: startY } = start;
    const { x: endX, y: endY } = end;

    // Remove tiles that are no longer in the render area
    for (const key in this.renderedTiles) {
      const tile = this.renderedTiles[key];
      const { x, y } = tile.coords;
      if (x < startX || x > endX || y < startY || y > endY) {
        tile.destructor();
        delete this.renderedTiles[key];
      }
    }

    // Add tiles that are in the render area but not rendered
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        if (this.renderedTiles[key]) continue;
        this.renderedTiles[key] = new Tile({
          coords: new Vector2(x, y),
          container: this.container,
          dimensions: this.global.dimensions,
        });
      }
    }
  }
}
