import { Global } from '@game/Controller';
import { Interactible, InteractionLayer } from '@util/abstract/Interactible';
import { TileMap } from '@util/abstract/TileMap';
import Vector2 from '@util/Vector2';

const STEP = 0.1;
let prevCheckedTile: Vector2 | null = null;
let highlightedInteractible: Interactible | null = null;

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
  prevCheckedTile = null;

  while (distance < maxDistanceInTiles) {
    const collision = checkCollisionInTile(current.rounded, normalizedDirection, layers, global);

    if (collision) {
      return collision;
    }

    current = Vector2.add(current, step);
    distance += STEP;
  }

  highlightedInteractible?.unhighlight();
  return false;
};

const checkCollisionInTile = (coords: Vector2, direction: Vector2, layers: InteractionLayer[], global: Global) => {
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
    const bounds = interactible.getBounds;

    const hasCollision = true;
    // TODO
    if (hasCollision) {
      highlightInteractible(interactible);
      return true;
    }
  }

  return false;
};

const highlightInteractible = (interactible: Interactible) => {
  if (highlightedInteractible !== interactible) {
    highlightedInteractible?.unhighlight();
    highlightedInteractible = interactible;
    highlightedInteractible.highlight();
  }
};

export default castRay;
