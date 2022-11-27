import { Global } from '@game/Controller';
import { CollisionLayer, Interactible } from '@game/interface/Interactible';
import { TileMap } from '@game/interface/TileMap';
import { Bounds } from '@game/util/EntityTypes';
import Vector2 from '@game/util/Vector2';

interface EntityMovement {
  position: Vector2;
  velocity: Vector2;
  sizeInTiles: Vector2;
  layers: CollisionLayer[];
  deltaInSeconds: number;
  global: Global;
  isGrounded: boolean;
}

export interface Collision {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  correction: Vector2;
}

const EXTRA_CORRECTION = 0.001; // In tiles
const COLLISION_STEP = 0.01; // In tiles

export const getMovementAfterCollisions = (movement: EntityMovement) => {
  const movementAfterVertical = applyVerticalMovement(movement);
  const movementAfterHorizontal = applyHorizontalMovement(movementAfterVertical);
  const movementAfterCheckingIfGrounded = checkIfGrounded(movementAfterHorizontal);

  return movementAfterCheckingIfGrounded;
};

const checkIfGrounded = (movement: EntityMovement) => {
  const { position, sizeInTiles, layers, global } = movement;

  const deltaPosition = new Vector2(0, COLLISION_STEP);
  const newBounds: Bounds = {
    x: position.x + deltaPosition.x - sizeInTiles.x / 2,
    y: position.y + deltaPosition.y - sizeInTiles.y / 2,
    width: sizeInTiles.x,
    height: sizeInTiles.y,
  };
  const collision = isCollidingWithLayers(newBounds, layers, global);
  const isGrounded = !!collision;

  const newMovement: EntityMovement = {
    ...movement,
    velocity: movement.velocity,
    isGrounded,
  };

  return newMovement;
};

const applyVerticalMovement = (movement: EntityMovement) => {
  const { velocity, position, deltaInSeconds, sizeInTiles, layers, global } = movement;
  if (velocity.y === 0) return movement;

  const sign = velocity.y > 0 ? 1 : -1;
  const totalDeltaYPosition = Math.abs(velocity.y * deltaInSeconds);

  for (let deltaYPosition = COLLISION_STEP; deltaYPosition <= totalDeltaYPosition; deltaYPosition += COLLISION_STEP) {
    if (deltaYPosition > totalDeltaYPosition) deltaYPosition = totalDeltaYPosition;

    const newBounds: Bounds = {
      x: position.x - sizeInTiles.x / 2,
      y: position.y + deltaYPosition * sign - sizeInTiles.y / 2,
      width: sizeInTiles.x,
      height: sizeInTiles.y,
    };
    const collision = isCollidingWithLayers(newBounds, layers, global);

    if (!!collision) {
      const newMovement: EntityMovement = {
        ...movement,
        position: new Vector2(position.x, collision.correction.y),
        velocity: new Vector2(velocity.x, 0),
      };

      return newMovement;
    }

    if (deltaYPosition >= totalDeltaYPosition) break;
  }

  const newMovement: EntityMovement = {
    ...movement,
    position: new Vector2(position.x, position.y + velocity.y * deltaInSeconds),
  };

  return newMovement;
};

const applyHorizontalMovement = (movement: EntityMovement) => {
  const { velocity, position, deltaInSeconds, sizeInTiles, layers, global } = movement;
  if (velocity.x === 0) return movement;

  const sign = velocity.x > 0 ? 1 : -1;
  const totalDeltaXPosition = Math.abs(velocity.x * deltaInSeconds);

  for (let deltaXPosition = COLLISION_STEP; deltaXPosition <= totalDeltaXPosition; deltaXPosition += COLLISION_STEP) {
    if (deltaXPosition > totalDeltaXPosition) deltaXPosition = totalDeltaXPosition;

    const newBounds: Bounds = {
      x: position.x + deltaXPosition * sign - sizeInTiles.x / 2,
      y: position.y - sizeInTiles.y / 2,
      width: sizeInTiles.x,
      height: sizeInTiles.y,
    };
    const collision = isCollidingWithLayers(newBounds, layers, global);

    if (!!collision) {
      const newMovement: EntityMovement = {
        ...movement,
        position: new Vector2(collision.correction.x, position.y),
        velocity: new Vector2(0, velocity.y),
      };

      return newMovement;
    }

    if (deltaXPosition >= totalDeltaXPosition) break;
  }

  const newMovement: EntityMovement = {
    ...movement,
    position: new Vector2(position.x + velocity.x * deltaInSeconds, position.y),
  };

  return newMovement;
};

export const isCollidingWithLayers = (bounds: Bounds, layers: CollisionLayer[], global: Global) => {
  const entitiesCollision = isCollidingWithEntities(bounds, layers, global);
  if (!!entitiesCollision) return entitiesCollision;

  const tileMapsCollision = isCollidingWithTileMaps(bounds, layers, global);
  if (!!tileMapsCollision) return tileMapsCollision;

  return false;
};

const isCollidingWithEntities = (bounds: Bounds, layers: CollisionLayer[], global: Global) => {
  const entities = [global.controller.entities.player];

  for (const entity of entities) {
    if (layers.includes(entity.collisionLayer)) {
      const entityBounds = entity.bounds;
      const collision = areBoundsColliding(bounds, entityBounds);
      if (!!collision) return collision;
    }
  }

  return false;
};

const isCollidingWithTileMaps = (bounds: Bounds, layers: CollisionLayer[], global: Global) => {
  let minX = Math.floor(bounds.x);
  let maxX = Math.ceil(bounds.x + bounds.width);
  let minY = Math.floor(bounds.y);
  let maxY = Math.ceil(bounds.y + bounds.height);

  const tileMaps: TileMap<any>[] = [global.controller.world.ground];

  for (let i = minX; i <= maxX; i++)
    for (let j = minY; j <= maxY; j++) {
      const interactibles: Interactible[] = [];
      const coords = new Vector2(i, j);

      tileMaps.forEach((tileMap) => {
        const interactible = tileMap.elementAtCoords(coords) as Interactible;
        if (interactible && layers.includes(interactible.collisionLayer)) interactibles.push(interactible);
      });

      for (const interactible of interactibles) {
        const interactibleBounds = interactible.bounds;
        const collision = areBoundsColliding(bounds, interactibleBounds);
        if (!!collision) return collision;
      }
    }
};

export const areBoundsColliding = (bounds1: Bounds, bounds2: Bounds) => {
  const entity1 = {
    x: bounds1.x + bounds1.width / 2,
    y: bounds1.y + bounds1.height / 2,
    width: bounds1.width,
    height: bounds1.height,
    halfWidth: bounds1.width / 2,
    halfHeight: bounds1.height / 2,
  };

  const entity2 = {
    x: bounds2.x + bounds2.width / 2,
    y: bounds2.y + bounds2.height / 2,
    width: bounds2.width,
    height: bounds2.height,
    halfWidth: bounds2.width / 2,
    halfHeight: bounds2.height / 2,
  };

  const collides =
    entity1.x - entity1.halfWidth < entity2.x + entity2.halfWidth &&
    entity1.x + entity1.halfWidth > entity2.x - entity2.halfWidth &&
    entity1.y - entity1.halfHeight < entity2.y + entity2.halfHeight &&
    entity1.y + entity1.halfHeight > entity2.y - entity2.halfHeight;

  if (!collides) return false;

  const horizontal = entity1.x - entity2.x;
  const vertical = entity1.y - entity2.y;

  const left = horizontal < 0;
  const right = horizontal > 0;
  const top = vertical < 0;
  const bottom = vertical > 0;

  const leftCorrection = entity2.x - entity2.halfWidth - entity1.halfWidth - EXTRA_CORRECTION;
  const rightCorrection = entity2.x + entity2.halfWidth + entity1.halfWidth + EXTRA_CORRECTION;
  const topCorrection = entity2.y - entity2.halfWidth - entity1.halfHeight - EXTRA_CORRECTION;
  const bottomCorrection = entity2.y + entity2.halfWidth + entity1.halfHeight + EXTRA_CORRECTION;

  return {
    left,
    right,
    top,
    bottom,
    correction: new Vector2(left ? leftCorrection : rightCorrection, top ? topCorrection : bottomCorrection),
  } as Collision;
};
