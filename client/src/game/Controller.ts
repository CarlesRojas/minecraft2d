import * as PIXI from 'pixi.js';
import { EventSystem } from '@pixi/events';

import Vector2 from '@util/Vector2';
import GameClass from '@util/GameClass';
import DevTools from '@game/DevTools';
import World from '@game/world/World';
import { Events } from '@util/Events';
import textures from '@game/tools/Textures';
import Character from '@game/Character';
import Camera from '@game/Camera';
import Interaction from '@game/Interaction';

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
  childs: { [key in Child]?: GameClass };
  events: Events;
  controller: Controller;
}

export interface ControllerProps {
  container: HTMLElement;
  dimensions: Dimensions;
  events: Events;
}

export default class Controller extends GameClass {
  private _global: Global;

  constructor({ container, dimensions, events }: ControllerProps) {
    super();

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

    this.#enableInteraction();
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

  #enableInteraction() {
    this._global.app.stage.interactive = false;
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
    await Promise.all([PIXI.Assets.loadBundle('blocks'), PIXI.Assets.loadBundle('characters')]);
    this.#handleLoadingComplete();
  }

  #handleLoadingComplete() {
    this._global.childs[Child.DEV_TOOLS] = new DevTools({ global: this._global });
    this._global.childs[Child.WORLD] = new World({ global: this._global });
    this._global.childs[Child.CHARACTER] = new Character({ global: this._global, dimensions: this._global.dimensions });
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
    return this._global.childs[Child.CHARACTER] as Character;
  }

  get camera() {
    return this._global.childs[Child.CAMERA] as Camera;
  }

  get interaction() {
    return this._global.childs[Child.INTERACTION] as Interaction;
  }
}
