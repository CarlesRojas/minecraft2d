import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@util/abstract/Mono';
import screenToTiles from '@util/ScreenToTiles';
import Vector2 from '@util/Vector2';

export interface CameraProps {
  global: Global;
}

const CAMERA_SCALE = 1;

export default class Camera implements Mono {
  private _global: Global;

  constructor({ global }: CameraProps) {
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

  // #################################################
  //   GETTER
  // #################################################

  get positionInTiles() {
    const stageX = this._global.app.stage.position.x;
    const stageY = this._global.app.stage.position.y;

    return screenToTiles(new Vector2(stageX, stageY), this._global.dimensions);
  }
}
