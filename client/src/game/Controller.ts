import * as PIXI from 'pixi.js';
import { EventSystem } from '@pixi/events';

import Vector2 from '@util/Vector2';
import GameClass from '@util/GameClass';
import textureManifest from '@asset/texture/textureManifest.json';
import DevTools from '@game/DevTools';
import World from '@game/world/World';
import { Events } from '@util/Events';
import { HORIZONTAL_TILES_PER_SCREEN } from '@game/constant/constants';

export enum Child {
  DEV_TOOLS = 'dev-tools',
  WORLD = 'world',
}

export interface Dimensions {
  screen: Vector2;
  tile: number;
}

export interface Global {
  app: PIXI.Application;
  dimensions: Dimensions;
  childs: { [key in Child]?: GameClass };
  events: Events;
}

export interface ControllerProps {
  container: HTMLElement;
  dimensions: Dimensions;
  events: Events;
}

export default class Controller extends GameClass {
  global: Global;

  constructor({ container, dimensions, events }: ControllerProps) {
    super();

    this.global = {
      app: new PIXI.Application({
        width: dimensions.screen.x,
        height: dimensions.screen.y,
        backgroundColor: 0x91bfff,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      }),
      dimensions,
      childs: {},
      events,
    };

    this.#enableInteraction();
    this.addViewToWindow(container);
    this.#loadAssets();
  }

  destructor() {
    for (const value of Object.values(this.global.childs)) value.destructor();
  }

  // #################################################
  //   ENABLE INTERACTION
  // #################################################

  #enableInteraction() {
    delete PIXI.Renderer.__plugins.interaction;
    if (!('events' in this.global.app.renderer)) this.global.app.renderer.addSystem(EventSystem, 'events');
  }

  // #################################################
  //   ADD VIEW
  // #################################################

  addViewToWindow(container: HTMLElement) {
    const oldCanvases = container.getElementsByTagName('canvas');
    if (oldCanvases.length)
      for (let i = 0; i < oldCanvases.length; i++) oldCanvases[i].parentNode?.removeChild(oldCanvases[0]);
    container.appendChild(this.global.app.view as any);
  }

  // #################################################
  //   LOAD ASSETS
  // #################################################

  async #loadAssets() {
    PIXI.Assets.init({ manifest: textureManifest });
    await PIXI.Assets.loadBundle('blocks');
    this.#handleLoadingComplete();
  }

  #handleLoadingComplete() {
    this.global.childs[Child.DEV_TOOLS] = new DevTools({ global: this.global });
    this.global.childs[Child.WORLD] = new World({ global: this.global });
    this.handleResize(this.global.dimensions);
    this.#startGameLoop();
  }

  // #################################################
  //   RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    this.global.dimensions = dimensions;
    this.global.app.renderer.resize(dimensions.screen.x, dimensions.screen.y);
    for (const value of Object.values(this.global.childs)) value.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  #startGameLoop() {
    if (!this.global) return;
    this.global.app.ticker.add(() => this.gameLoop(this.global.app.ticker.deltaMS / 1000));
  }

  gameLoop(deltaInSeconds: number) {
    for (const value of Object.values(this.global.childs)) value.gameLoop(deltaInSeconds);
  }
}
