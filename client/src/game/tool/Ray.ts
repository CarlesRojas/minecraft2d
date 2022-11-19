import { Global } from '@game/Controller';
import { Interactible, InteractionLayer } from '@util/abstract/Interactible';
import { TileMap } from '@util/abstract/TileMap';
import { Bounds } from '@util/EntityTypes';
import Vector2 from '@util/Vector2';

const STEP = 0.01;
let prevCheckedTile: Vector2 | null = null;
let highlightedInteractible: Interactible | null = null;

export interface RayCollision {
  point: Vector2;
  interactible: Interactible;
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
    const collision = checkCollisionInTile(current.rounded, current, layers, global);

    if (collision) return collision;

    current = Vector2.add(current, step);
    distance += STEP;
  }

  prevCheckedTile = null;
  highlightedInteractible?.stopInteracting();
  return false;
};

const checkCollisionInTile = (coords: Vector2, point: Vector2, layers: InteractionLayer[], global: Global) => {
  if (prevCheckedTile && prevCheckedTile.equals(coords)) return false;
  prevCheckedTile = coords;

  const interactibles: Interactible[] = [];
  const tileMaps: TileMap<any>[] = [global.controller.world.ground, global.controller.world.background];

  tileMaps.forEach((tileMap) => {
    const interactible = tileMap.elementAtCoords(coords) as Interactible;
    if (interactible && layers.includes(interactible.interactionLayer)) interactibles.push(interactible);
  });

  for (const interactible of interactibles) {
    if (!layers.includes(interactible.interactionLayer)) continue;
    const collision = getCollisionPoint(point, interactible.getBounds);
    if (collision) return { point: collision, interactible } as RayCollision;
  }

  return false;
};

const getCollisionPoint = (point: Vector2, bounds: Bounds) => {
  const { x, y, width, height } = bounds;
  const left = x;
  const right = x + width;
  const top = y;
  const bottom = y + height;

  if (
    !(
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    )
  )
    return false;

  const closestX = Math.max(left, Math.min(point.x, right));
  const closestY = Math.max(top, Math.min(point.y, bottom));

  return new Vector2(closestX, closestY);
};

export default castRay;
