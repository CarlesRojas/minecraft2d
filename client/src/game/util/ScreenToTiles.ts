import { Dimensions } from '@game/Controller';
import Vector2 from '@game/util/Vector2';

const screenToTiles = (screenPoint: Vector2, dimensions: Dimensions): Vector2 => {
  const { tile, screen } = dimensions;
  return new Vector2((screenPoint.x - screen.x / 2) / tile, (screenPoint.y - screen.y / 2) / tile);
};

export default screenToTiles;
