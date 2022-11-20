import { Global } from '@game/Controller';
import { CollisionLayer, Interactible } from '@util/abstract/Interactible';
import { TileMap } from '@util/abstract/TileMap';
import { Bounds } from '@util/EntityTypes';
import Vector2 from '@util/Vector2';

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
  isColliding: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  correction: Vector2;
}

const noCollision: Collision = {
  isColliding: false,
  left: false,
  right: false,
  top: false,
  bottom: false,
  correction: new Vector2(0, 0),
};

export const getMovementAfterCollisions = (movement: EntityMovement) => {
  const movementAfterVertical = applyVerticalMovement(movement);
  const movementAfterHorizontal = applyHorizontalMovement(movementAfterVertical);
  const movementAfterCheckingIfGrounded = checkIfGrounded(movementAfterHorizontal);

  return movementAfterCheckingIfGrounded;
};

const checkIfGrounded = (movement: EntityMovement) => {
  const deltaPosition = new Vector2(0, 0.1);

  const collision = isEntityColliding(movement, deltaPosition);
  const isGrounded = collision && collision.isColliding;

  const newMovement: EntityMovement = {
    ...movement,
    velocity: new Vector2(movement.velocity.x, isGrounded ? 0 : movement.velocity.y),
    isGrounded,
  };

  return newMovement;
};

const applyVerticalMovement = (movement: EntityMovement) => {
  const { velocity, position, deltaInSeconds } = movement;
  if (velocity.y === 0) return movement;

  const deltaPosition = new Vector2(0, velocity.y * deltaInSeconds);
  const collision = isEntityColliding(movement, deltaPosition);

  const newMovement: EntityMovement = {
    ...movement,
    position:
      collision && collision.isColliding
        ? new Vector2(position.x, collision.correction.y)
        : new Vector2(position.x, position.y + velocity.y * deltaInSeconds),
    velocity: collision && collision.isColliding ? new Vector2(velocity.x, 0) : velocity,
  };

  return newMovement;
};

const applyHorizontalMovement = (movement: EntityMovement) => {
  const { velocity, position, deltaInSeconds } = movement;
  if (velocity.x === 0) return movement;

  const deltaPosition = new Vector2(velocity.x * deltaInSeconds, 0);
  const collision = isEntityColliding(movement, deltaPosition);

  const newMovement: EntityMovement = {
    ...movement,
    position:
      collision && collision.isColliding
        ? new Vector2(collision.correction.x, position.y)
        : new Vector2(position.x + velocity.x * deltaInSeconds, position.y),
    velocity: collision && collision.isColliding ? new Vector2(0, velocity.y) : velocity,
  };

  return newMovement;
};

const isEntityColliding = (movement: EntityMovement, deltaPosition: Vector2) => {
  const { position, sizeInTiles, global, layers } = movement;

  const x = position.x + deltaPosition.x;
  const y = position.y + deltaPosition.y;

  let minX = Math.floor(x - sizeInTiles.x / 2);
  let maxX = Math.ceil(x + sizeInTiles.x / 2);
  let minY = Math.floor(y - sizeInTiles.y / 2);
  let maxY = Math.ceil(y + sizeInTiles.y / 2);

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
        const newBounds: Bounds = {
          x: position.x + deltaPosition.x - sizeInTiles.x / 2,
          y: position.y + deltaPosition.y - sizeInTiles.y / 2,
          width: sizeInTiles.x,
          height: sizeInTiles.y,
        };

        const collision = areBoundsColliding(newBounds, interactibleBounds);
        if (collision.isColliding) return collision;
      }
    }

  return false;
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

  if (!collides) return noCollision;

  const horizontal = entity1.x - entity2.x;
  const vertical = entity1.y - entity2.y;

  const left = horizontal > 0;
  const right = horizontal < 0;
  const top = vertical > 0;
  const bottom = vertical < 0;

  const leftCorrection = entity2.x + 0.5 + entity1.halfWidth;
  const rightCorrection = entity2.x - 0.5 - entity1.halfWidth;
  const topCorrection = entity2.y + 0.5 + entity1.halfHeight;
  const bottomCorrection = entity2.y - 0.5 - entity1.halfHeight;

  return {
    isColliding: true,
    left,
    right,
    top,
    bottom,
    correction: new Vector2(left ? leftCorrection : rightCorrection, top ? topCorrection : bottomCorrection),
  } as Collision;
};
