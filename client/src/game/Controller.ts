import * as PIXI from 'pixi.js';

import Camera from '@game/Camera';
import DevTools from '@game/DevTools';
import Entities from '@game/Entities';
import Interaction from '@game/Interaction';
import textures from '@game/system/Textures';
import World from '@game/world/World';
import { Mono } from '@util/abstract/Mono';
import { Events } from '@util/Events';
import Vector2 from '@util/Vector2';

export enum Child {
  DEV_TOOLS = 'dev-tools',
  ENTITIES = 'entities',
  WORLD = 'world',
  CAMERA = 'camera',
  INTERACTION = 'interaction',
}

export interface Dimensions {
  screen: Vector2;
  tile: number;
}

export interface Global {
  app: PIXI.Application;
  dimensions: Dimensions;
  childs: { [key in Child]?: Mono };
  events: Events;
  controller: Controller;
  stage: PIXI.Container;
}

export interface ControllerProps {
  container: HTMLElement;
  dimensions: Dimensions;
  events: Events;
}

export default class Controller implements Mono {
  private _global: Global;

  constructor({ container, dimensions, events }: ControllerProps) {
    this._global = {
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
      controller: this,
      stage: new PIXI.Container(),
    };

    this._global.app.stage.addChild(this._global.stage);

    this.addViewToWindow(container);
    this.#loadAssets();
  }

  destructor() {
    for (const value of Object.values(this._global.childs)) value.destructor();
    this._global.app.stage.removeChild(this._global.stage);
  }

  // #################################################
  //   RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    this._global.dimensions = dimensions;
    this._global.app.renderer.resize(dimensions.screen.x, dimensions.screen.y);
    for (const value of Object.values(this._global.childs)) value.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  #startGameLoop() {
    if (!this._global) return;
    this._global.app.ticker.add(() => this.gameLoop(this._global.app.ticker.deltaMS / 1000));
  }

  gameLoop(deltaInSeconds: number) {
    for (const value of Object.values(this._global.childs)) value.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   ADD VIEW
  // #################################################

  addViewToWindow(container: HTMLElement) {
    const oldCanvases = container.getElementsByTagName('canvas');
    if (oldCanvases.length)
      for (let i = 0; i < oldCanvases.length; i++) oldCanvases[i].parentNode?.removeChild(oldCanvases[0]);
    container.appendChild(this._global.app.view as any);
  }

  // #################################################
  //   LOAD ASSETS
  // #################################################

  async #loadAssets() {
    PIXI.Assets.init({ manifest: textures });
    await Promise.all([PIXI.Assets.loadBundle('blocks'), PIXI.Assets.loadBundle('entities')]);
    this.#handleLoadingComplete();
  }

  #handleLoadingComplete() {
    this._global.childs[Child.DEV_TOOLS] = new DevTools({ global: this._global });
    this._global.childs[Child.WORLD] = new World({ global: this._global });
    this._global.childs[Child.ENTITIES] = new Entities({ global: this._global });
    this._global.childs[Child.CAMERA] = new Camera({ global: this._global });
    this._global.childs[Child.INTERACTION] = new Interaction({ global: this._global });

    this.handleResize(this._global.dimensions);
    this.#startGameLoop();
  }

  // #################################################
  //   GETTERS
  // #################################################

  get devTools() {
    return this._global.childs[Child.DEV_TOOLS] as DevTools;
  }

  get world() {
    return this._global.childs[Child.WORLD] as World;
  }

  get entities() {
    return this._global.childs[Child.ENTITIES] as Entities;
  }

  get camera() {
    return this._global.childs[Child.CAMERA] as Camera;
  }

  get interaction() {
    return this._global.childs[Child.INTERACTION] as Interaction;
  }
}
