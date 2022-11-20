import { Global } from '@game/Controller';
import { Interactible, InteractionLayer } from '@util/abstract/Interactible';
import { TileMap } from '@util/abstract/TileMap';
import { Bounds } from '@util/EntityTypes';
import Vector2 from '@util/Vector2';

const STEP = 0.01;
let prevCheckedTile: Vector2 | null = null;
let highlightedInteractible: Interactible | null = null;

export interface RayCollision {
  point: Vector2 | false;
  coords: Vector2;
  blockSide: BlockSide;
  interactible: Interactible;
}

export enum BlockSide {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  NONE = 'none',
}

const castRay = (
  origin: Vector2,
  direction: Vector2,
  maxDistanceInTiles: number,
  layers: InteractionLayer[],
  global: Global
) => {
  const normalizedDirection = direction.normalized;
  const step = Vector2.mul(normalizedDirection, STEP);
  let current = origin;
  let distance = 0;

  while (distance < maxDistanceInTiles) {
    const collision = checkCollisionInTile(current.rounded, current, normalizedDirection, layers, global);

    if (collision) return collision;

    current = Vector2.add(current, step);
    distance += STEP;
  }

  prevCheckedTile = null;
  highlightedInteractible?.stopInteracting();
  return false;
};

const checkCollisionInTile = (
  coords: Vector2,
  point: Vector2,
  direction: Vector2,
  layers: InteractionLayer[],
  global: Global
) => {
  if (prevCheckedTile && prevCheckedTile.equals(coords)) return false;
  prevCheckedTile = coords;

  const interactibles: Interactible[] = [];
  const tileMaps: TileMap<any>[] = [global.controller.world.ground, global.controller.world.background];

  tileMaps.forEach((tileMap) => {
    const interactible = tileMap.elementAtCoords(coords) as Interactible;
    if (interactible && layers.includes(interactible.interactionLayer)) interactibles.push(interactible);
  });

  for (const interactible of interactibles) {
    const intersectionPoint = getIntersectionPoint(point, Vector2.invert(direction), interactible.bounds);
    const blockSide = getCollisionPointSide(coords, intersectionPoint);
    if (intersectionPoint) return { coords, point: intersectionPoint, interactible, blockSide } as RayCollision;
  }

  return false;
};

const getIntersectionPoint = (point: Vector2, direction: Vector2, bounds: Bounds) => {
  const { x, y, width, height } = bounds;
  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;

  const topLeft = new Vector2(left, top);
  const topRight = new Vector2(right, top);
  const bottomLeft = new Vector2(left, bottom);
  const bottomRight = new Vector2(right, bottom);

  const topIntersection = getLineIntersection(point, direction, topLeft, topRight);
  const bottomIntersection = getLineIntersection(point, direction, bottomLeft, bottomRight);
  const leftIntersection = getLineIntersection(point, direction, topLeft, bottomLeft);
  const rightIntersection = getLineIntersection(point, direction, topRight, bottomRight);

  if (topIntersection) return topIntersection;
  if (bottomIntersection) return bottomIntersection;
  if (leftIntersection) return leftIntersection;
  if (rightIntersection) return rightIntersection;

  return false;
};

const getLineIntersection = (point: Vector2, direction: Vector2, lineStart: Vector2, lineEnd: Vector2) => {
  const denominator = (lineEnd.y - lineStart.y) * direction.x - (lineEnd.x - lineStart.x) * direction.y;
  if (denominator === 0) return false;

  let a = point.y - lineStart.y;
  let b = point.x - lineStart.x;
  const numerator1 = (lineEnd.x - lineStart.x) * a - (lineEnd.y - lineStart.y) * b;
  const numerator2 = direction.x * a - direction.y * b;

  a = numerator1 / denominator;
  b = numerator2 / denominator;

  if (a > 0 && a < 1 && b > 0 && b < 1) {
    const x = point.x + a * direction.x;
    const y = point.y + a * direction.y;
    return new Vector2(x, y);
  }

  return false;
};

export const getCollisionPointSide = (coords: Vector2, point: Vector2 | false) => {
  if (!point) return BlockSide.NONE;

  const distance = Vector2.sub(coords, point);

  if (Math.abs(distance.x) > Math.abs(distance.y)) {
    if (distance.x > 0) return BlockSide.LEFT;
    return BlockSide.RIGHT;
  } else {
    if (distance.y > 0) return BlockSide.TOP;
    return BlockSide.BOTTOM;
  }
};

export default castRay;
