import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@util/abstract/Mono';
import { Event } from '@util/Events';
import screenToTiles from '@util/ScreenToTiles';
import Vector2 from '@util/Vector2';

export interface InteractionProps {
  global: Global;
}

export enum MouseButton {
  LEFT = 'mouseLeft',
  MIDDLE = 'mouseMiddle',
  RIGHT = 'mouseRight',
}

export default class Interaction implements Mono {
  private _global: Global;
  private _prevKeyPressed: { [key: string]: boolean } = {};
  private _keyPressed: { [key: string]: boolean } = {};
  private _mousePositionInTiles: Vector2;
  private _mouseScreenPosition: Vector2;

  constructor({ global }: InteractionProps) {
    this._global = global;
    this._global.app.stage.interactive = false;

    this._mousePositionInTiles = new Vector2(0, 0);
    this._mouseScreenPosition = new Vector2(0, 0);

    this._global.events.sub(Event.ON_MOUSE_MOVE, this.#handleMouseMove.bind(this));
    this._global.events.sub(Event.ON_KEY_DOWN, this.#handleKeyDown.bind(this));
    this._global.events.sub(Event.ON_KEY_UP, this.#handleKeyUp.bind(this));
    this._global.events.sub(Event.ON_MOUSE_DOWN, this.#handleMouseDown.bind(this));
    this._global.events.sub(Event.ON_MOUSE_UP, this.#handleMouseUp.bind(this));
  }

  destructor() {
    this._global.events.unsub(Event.ON_MOUSE_MOVE, this.#handleMouseMove.bind(this));
    this._global.events.unsub(Event.ON_KEY_DOWN, this.#handleKeyDown.bind(this));
    this._global.events.unsub(Event.ON_KEY_UP, this.#handleKeyUp.bind(this));
    this._global.events.unsub(Event.ON_MOUSE_DOWN, this.#handleMouseDown.bind(this));
    this._global.events.unsub(Event.ON_MOUSE_UP, this.#handleMouseUp.bind(this));
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
    this.#getMousePositionInTiles();
  }

  #getMousePositionInTiles() {
    const mousePositionInTiles = screenToTiles(
      new Vector2(this._mouseScreenPosition.x, this._mouseScreenPosition.y),
      this._global.dimensions
    );
    const cameraPosition = this._global.controller.camera.positionInTiles;

    this._mousePositionInTiles = new Vector2(
      mousePositionInTiles.x - cameraPosition.x,
      mousePositionInTiles.y - cameraPosition.y
    );
  }

  // #################################################
  //   EVENTS
  // #################################################

  #handleMouseMove(e: MouseEvent) {
    this._mouseScreenPosition = new Vector2(e.clientX, e.clientY);
  }

  #handleKeyDown(e: KeyboardEvent) {
    this._keyPressed[e.code] = true;
  }

  #handleKeyUp(e: KeyboardEvent) {
    this._keyPressed[e.code] = false;
  }

  #handleMouseDown(e: MouseEvent) {
    const code = e.button === 0 ? MouseButton.LEFT : e.button === 1 ? MouseButton.MIDDLE : MouseButton.RIGHT;
    this._keyPressed[code] = true;
  }

  #handleMouseUp(e: MouseEvent) {
    const code = e.button === 0 ? MouseButton.LEFT : e.button === 1 ? MouseButton.MIDDLE : MouseButton.RIGHT;
    this._keyPressed[code] = false;
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

  get mouseScreenPosition() {
    return this._mouseScreenPosition;
  }

  get mousePositionInTiles() {
    return this._mousePositionInTiles;
  }
}
