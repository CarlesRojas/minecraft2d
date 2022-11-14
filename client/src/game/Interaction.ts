import * as PIXI from 'pixi.js';
import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import { Event } from '@util/Events';
import Vector2 from '@util/Vector2';

export interface InteractionProps {
  global: Global;
}

export default class Interaction extends GameClass {
  private _global: Global;
  private _prevKeyPressed: { [key: string]: boolean } = {};
  private _keyPressed: { [key: string]: boolean } = {};
  private _mousePosition: Vector2;

  constructor({ global }: InteractionProps) {
    super();
    this._global = global;

    this._mousePosition = new Vector2(0, 0);

    this._global.events.sub(Event.ON_MOUSE_MOVE, this.#handleMouseMove.bind(this));
    this._global.events.sub(Event.ON_KEY_DOWN, this.#handleKeyDown.bind(this));
    this._global.events.sub(Event.ON_KEY_UP, this.#handleKeyUp.bind(this));
  }

  destructor() {
    this._global.events.unsub(Event.ON_MOUSE_MOVE, this.#handleMouseMove.bind(this));
    this._global.events.unsub(Event.ON_KEY_DOWN, this.#handleKeyDown.bind(this));
    this._global.events.unsub(Event.ON_KEY_UP, this.#handleKeyUp.bind(this));
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {}

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this._prevKeyPressed = { ...this._keyPressed };
  }

  // #################################################
  //   EVENTS
  // #################################################

  #handleMouseMove(e: MouseEvent) {
    this._mousePosition = new Vector2(e.clientX, e.clientY);
  }

  #handleKeyDown(e: KeyboardEvent) {
    this._keyPressed[e.code] = true;
  }

  #handleKeyUp(e: KeyboardEvent) {
    this._keyPressed[e.code] = false;
  }

  // #################################################
  //   GETTERS
  // #################################################

  get isKeyFirstPressed() {
    return (key: string) => this._keyPressed[key] && !this._prevKeyPressed[key];
  }

  get isKeyPressed() {
    return (key: string) => this._keyPressed[key];
  }

  get mousePosition() {
    return this._mousePosition;
  }
}
