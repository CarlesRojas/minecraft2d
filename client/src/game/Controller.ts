import * as PIXI from 'pixi.js';

import { Mono } from '@game/interface/Mono';
import Camera from '@game/layer/camera/Camera';
import DevTools from '@game/layer/devtools/DevTools';
import Entities from '@game/layer/entities/Entities';
import Interaction from '@game/layer/interaction/Interaction';
import World from '@game/layer/world/World';
import textures from '@game/system/Textures';
import Vector2 from '@game/util/Vector2';
import { Events } from '@util/Events';

interface Layers {
  devTools: Mono | null;
  entities: Mono | null;
  world: Mono | null;
  camera: Mono | null;
  interaction: Mono | null;
}

export interface Dimensions {
  screen: Vector2;
  tile: number;
}

export interface Global {
  app: PIXI.Application;
  dimensions: Dimensions;
  events: Events;
  controller: Controller;
  stage: PIXI.Container;
}

interface ControllerProps {
  container: HTMLElement;
  dimensions: Dimensions;
  events: Events;
}

export default class Controller implements Mono {
  private _global: Global;
  private _layers: Layers;

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
      events,
      controller: this,
      stage: new PIXI.Container(),
    };

    this._layers = {
      devTools: null,
      entities: null,
      world: null,
      camera: null,
      interaction: null,
    };

    this._global.app.stage.addChild(this._global.stage);

    this.addViewToWindow(container);
    this.#loadAssets();
  }

  destructor() {
    for (const layer of Object.values(this._layers)) layer.destructor();
    this._global.app.stage.removeChild(this._global.stage);
  }

  // #################################################
  //   RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    this._global.dimensions = dimensions;
    this._global.app.renderer.resize(dimensions.screen.x, dimensions.screen.y);
    for (const layer of Object.values(this._layers)) layer && layer.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  #startGameLoop() {
    if (!this._global) return;
    this._global.app.ticker.add(() => this.gameLoop(this._global.app.ticker.deltaMS / 1000));
  }

  gameLoop(deltaInSeconds: number) {
    for (const layer of Object.values(this._layers)) layer.gameLoop(deltaInSeconds);
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
    this._layers.devTools = new DevTools({ global: this._global });
    this._layers.world = new World({ global: this._global });
    this._layers.entities = new Entities({ global: this._global });
    this._layers.camera = new Camera({ global: this._global });
    this._layers.interaction = new Interaction({ global: this._global });

    this.handleResize(this._global.dimensions);
    this.#startGameLoop();
  }

  // #################################################
  //   GETTERS
  // #################################################

  get devTools() {
    return this._layers.devTools as DevTools;
  }

  get world() {
    return this._layers.world as World;
  }

  get entities() {
    return this._layers.entities as Entities;
  }

  get camera() {
    return this._layers.camera as Camera;
  }

  get interaction() {
    return this._layers.interaction as Interaction;
  }
}
