import Vector2 from '@util/Vector2';

export default abstract class Controller {
  constructor() {}
  abstract destructor(): void;
  abstract handleResize(dimensions: Vector2): void;
  abstract gameLoop(deltaInSeconds: number): void;
}
