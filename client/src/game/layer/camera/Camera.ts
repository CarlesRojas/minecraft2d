import { Dimensions, Global } from '@game/Controller';
import { Mono } from '@game/interface/Mono';
import screenToTiles from '@game/util/ScreenToTiles';
import Vector2 from '@game/util/Vector2';

interface CameraProps {
  global: Global;
}

export default class Camera implements Mono {
  private _global: Global;

  // CAMERA MOVEMENT
  private _targetPositionInTiles: Vector2;
  private _minTilesPerSecond = 4;

  constructor({ global }: CameraProps) {
    this._global = global;

    this._targetPositionInTiles = this._global.controller.entities.player.facePosition;
    this.#moveCameraTo(this._targetPositionInTiles);
  }

  destructor() {}

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    this.#moveCameraTo(this._targetPositionInTiles);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this._targetPositionInTiles = this._global.controller.entities.player.facePosition;

    this.#panCameraToTargetPosition(deltaInSeconds);
  }

  // #################################################
  //   CAMERA MOVEMENT
  // #################################################

  #panCameraToTargetPosition(deltaInSeconds: number) {
    const targetPositionInTiles = this._targetPositionInTiles;
    const invertedPositionInTiles = Vector2.mul(this.positionInTiles, -1);

    if (targetPositionInTiles.equals(invertedPositionInTiles)) return;

    const magnitude = Vector2.sub(targetPositionInTiles, invertedPositionInTiles).magnitude;
    let stepMagnitude = Math.pow(magnitude, 2) * deltaInSeconds;
    stepMagnitude = Math.max(stepMagnitude, this._minTilesPerSecond * deltaInSeconds);

    if (magnitude < stepMagnitude) {
      this.#moveCameraTo(targetPositionInTiles);
      return;
    }

    const direction = Vector2.direction(invertedPositionInTiles, targetPositionInTiles);
    const step = Vector2.mul(direction, stepMagnitude);
    const newPosition = Vector2.add(invertedPositionInTiles, step);

    this.#moveCameraTo(newPosition);
  }

  #moveCameraTo(newPositionInTiles: Vector2) {
    const { tile, screen } = this._global.dimensions;

    const newPos = new Vector2(
      -newPositionInTiles.x * tile + screen.x / 2,
      -newPositionInTiles.y * tile + screen.y / 2
    );

    this._global.stage.position.set(newPos.x, newPos.y);
  }

  // #################################################
  //   GETTER
  // #################################################

  get positionInTiles() {
    const stageX = this._global.stage.position.x;
    const stageY = this._global.stage.position.y;

    return screenToTiles(new Vector2(stageX, stageY), this._global.dimensions);
  }
}
