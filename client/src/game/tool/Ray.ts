import { Global } from '@game/Controller';
import { Interactible, InteractionLayer } from '@util/abstract/Interactible';
import { TileMap } from '@util/abstract/TileMap';
import Vector2 from '@util/Vector2';

const STEP = 0.1;

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
    const collision = checkCollisionInTile(current, normalizedDirection, layers, global);

    if (collision) {
      console.log(collision);
      return collision;
    }

    current = Vector2.add(current, step);
    distance += STEP;
  }

  return false;
};

const checkCollisionInTile = (coords: Vector2, direction: Vector2, layers: InteractionLayer[], global: Global) => {
  const interactibles: Interactible[] = [];
  const tileMaps: TileMap<any>[] = [global.controller.world.ground, global.controller.world.background];

  tileMaps.forEach((tileMap) => {
    const interactible = tileMap.elementAtCoords(coords) as Interactible;
    if (interactible && layers.includes(interactible.interactionLayer)) interactibles.push(interactible);
  });

  for (const interactible of interactibles) {
    if (!layers.includes(interactible.interactionLayer)) continue;

    const bounds = interactible.getBounds;
    highlightInteractible(interactible);
  }

  return false;
};

let highlightedInteractible: Interactible | null = null;

const highlightInteractible = (interactible: Interactible) => {
  if (highlightedInteractible && highlightedInteractible !== interactible) {
    highlightedInteractible.unhighlight();
    highlightedInteractible = interactible;
    highlightedInteractible.highlight();
  }
};

export default castRay;
