import * as PIXI from 'pixi.js';

import Camera from '@game/Camera';
import DevTools from '@game/DevTools';
import Interaction from '@game/Interaction';
import Steve from '@game/Steve';
import textures from '@game/tool/Textures';
import World from '@game/world/World';
import { Mono } from '@util/abstract/Mono';
import { Events } from '@util/Events';
import Vector2 from '@util/Vector2';

export enum Child {
  DEV_TOOLS = 'dev-tools',
  WORLD = 'world',
  CHARACTER = 'character',
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
    };

    this.addViewToWindow(container);
    this.#loadAssets();
  }

  destructor() {
    for (const value of Object.values(this._global.childs)) value.destructor();
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
  //   ENABLE INTERACTION
  // #################################################

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
    await Promise.all([PIXI.Assets.loadBundle('blocks'), PIXI.Assets.loadBundle('characters')]);
    this.#handleLoadingComplete();
  }

  #handleLoadingComplete() {
    this._global.childs[Child.DEV_TOOLS] = new DevTools({ global: this._global });
    this._global.childs[Child.WORLD] = new World({ global: this._global });
    this._global.childs[Child.CHARACTER] = new Steve({ global: this._global, dimensions: this._global.dimensions });
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

  get character() {
    return this._global.childs[Child.CHARACTER] as Steve;
  }

  get camera() {
    return this._global.childs[Child.CAMERA] as Camera;
  }

  get interaction() {
    return this._global.childs[Child.INTERACTION] as Interaction;
  }
}
