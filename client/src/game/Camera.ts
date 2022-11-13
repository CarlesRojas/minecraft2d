import { Dimensions, Global } from '@game/Controller';
import GameClass from '@util/GameClass';
import Vector2 from '@util/Vector2';

export interface CameraProps {
  global: Global;
}

const CAMERA_SCALE = 1; // TODO change to 1

export default class Camera extends GameClass {
  private _global: Global;

  constructor({ global }: CameraProps) {
    super();
    this._global = global;

    this._global.app.stage.scale.set(CAMERA_SCALE);
  }

  destructor() {}

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {}

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    const characterPosition = this._global.controller.character.position;
    const { tile, screen } = this._global.dimensions;

    const newPos = new Vector2(
      (-characterPosition.x * tile + screen.x / (2 * CAMERA_SCALE)) * CAMERA_SCALE,
      (-characterPosition.y * tile + screen.y / (2 * CAMERA_SCALE)) * CAMERA_SCALE
    );

    this._global.app.stage.position.set(newPos.x, newPos.y);
  }
}
