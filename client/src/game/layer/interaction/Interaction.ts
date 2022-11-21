import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@game/interface/Mono';
import screenToTiles from '@game/util/ScreenToTiles';
import Vector2 from '@game/util/Vector2';
import { Event } from '@util/Events';

interface InteractionProps {
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
  private _mousePositionInTiles: Vector2 | null;
  private _mouseScreenPosition: Vector2 | null;

  // JOYSTICK
  private _usingJoystick = false;
  private _movingJoystick = false;
  private _joystickDirection = new Vector2(0, 0);

  constructor({ global }: InteractionProps) {
    this._global = global;
    this._global.app.stage.interactive = false;

    this._mousePositionInTiles = null;
    this._mouseScreenPosition = null;

    this._global.events.sub(Event.ON_MOUSE_MOVE, this.#handleMouseMove.bind(this));
    this._global.events.sub(Event.ON_KEY_DOWN, this.#handleKeyDown.bind(this));
    this._global.events.sub(Event.ON_KEY_UP, this.#handleKeyUp.bind(this));
    this._global.events.sub(Event.ON_MOUSE_DOWN, this.#handleMouseDown.bind(this));
    this._global.events.sub(Event.ON_MOUSE_UP, this.#handleMouseUp.bind(this));
    this._global.events.sub(Event.ON_JOYSTICK_MOVE, this.#handleJoystickMove.bind(this));
    this._global.events.sub(Event.ON_JOYSTICK_UP, this.#handleJoystickUp.bind(this));
  }

  destructor() {
    this._global.events.unsub(Event.ON_MOUSE_MOVE, this.#handleMouseMove.bind(this));
    this._global.events.unsub(Event.ON_KEY_DOWN, this.#handleKeyDown.bind(this));
    this._global.events.unsub(Event.ON_KEY_UP, this.#handleKeyUp.bind(this));
    this._global.events.unsub(Event.ON_MOUSE_DOWN, this.#handleMouseDown.bind(this));
    this._global.events.unsub(Event.ON_MOUSE_UP, this.#handleMouseUp.bind(this));
    this._global.events.unsub(Event.ON_JOYSTICK_MOVE, this.#handleJoystickMove.bind(this));
    this._global.events.unsub(Event.ON_JOYSTICK_UP, this.#handleJoystickUp.bind(this));
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
    this.#handleJoystickState();
  }

  #getMousePositionInTiles() {
    if (!this._mouseScreenPosition) return;

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

  #handleKeyDown(e: { code: string }) {
    this._keyPressed[e.code] = true;
  }

  #handleKeyUp(e: { code: string }) {
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

  #handleJoystickMove(direction: Vector2) {
    this._usingJoystick = true;
    this._movingJoystick = true;
    this._joystickDirection = direction;
    this._keyPressed[MouseButton.LEFT] = true;
  }

  #handleJoystickUp() {
    this._movingJoystick = false;
    this._keyPressed[MouseButton.LEFT] = false;
    this._keyPressed[MouseButton.RIGHT] = true;
  }

  #handleJoystickState() {
    if (!this._usingJoystick) return;

    if (this._movingJoystick) {
      const playerPositionInTiles = this._global.controller.entities.player.position;
      this._mousePositionInTiles = new Vector2(
        playerPositionInTiles.x + this._joystickDirection.x,
        playerPositionInTiles.y + this._joystickDirection.y
      );
    } else {
      this._mousePositionInTiles = null;
      this._keyPressed[MouseButton.RIGHT] = false;
    }
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

  get mousePositionInTiles() {
    return this._mousePositionInTiles;
  }
}
