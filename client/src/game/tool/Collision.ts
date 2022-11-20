import { Global } from '@game/Controller';
import { CollisionLayer, Interactible } from '@util/abstract/Interactible';
import { TileMap } from '@util/abstract/TileMap';
import { Bounds } from '@util/EntityTypes';
import Vector2 from '@util/Vector2';

interface EntityMovement {
  position: Vector2;
  velocity: Vector2;
  sizeInTiles: {
    width: number;
    height: number;
  };
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

  const collision = isCollidingWithEnviroment(movement, deltaPosition);
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
  const collision = isCollidingWithEnviroment(movement, deltaPosition);

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
  const collision = isCollidingWithEnviroment(movement, deltaPosition);

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

const isCollidingWithEnviroment = (movement: EntityMovement, deltaPosition: Vector2) => {
  const { position, sizeInTiles } = movement;

  const x = position.x + deltaPosition.x;
  const y = position.y + deltaPosition.y;

  let minX = Math.floor(x - sizeInTiles.width / 2);
  let maxX = Math.ceil(x + sizeInTiles.width / 2);
  let minY = Math.floor(y - sizeInTiles.height / 2);
  let maxY = Math.ceil(y + sizeInTiles.height / 2);

  for (let i = minX; i <= maxX; i++)
    for (let j = minY; j <= maxY; j++) {
      const collision = isCollidingAtCoords(movement, deltaPosition, new Vector2(i, j));
      if (collision.isColliding) return collision;
    }

  return false;
};

const isCollidingAtCoords = (movement: EntityMovement, deltaPosition: Vector2, coords: Vector2) => {
  const { global, layers } = movement;

  const interactibles: Interactible[] = [];
  const tileMaps: TileMap<any>[] = [global.controller.world.ground];

  tileMaps.forEach((tileMap) => {
    const interactible = tileMap.elementAtCoords(coords) as Interactible;
    if (interactible && layers.includes(interactible.collisionLayer)) interactibles.push(interactible);
  });

  for (const interactible of interactibles) {
    const interactibleBounds = interactible.bounds;
    const collision = isCollidingWithInteractible(movement, deltaPosition, interactibleBounds);
    if (collision.isColliding) return collision;
  }

  return noCollision;
};

const isCollidingWithInteractible = (movement: EntityMovement, deltaPosition: Vector2, interactibleBounds: Bounds) => {
  const { position, sizeInTiles } = movement;

  const interactible = {
    x: interactibleBounds.x + interactibleBounds.width / 2,
    y: interactibleBounds.y + interactibleBounds.height / 2,
    width: interactibleBounds.width,
    height: interactibleBounds.height,
  };

  const player = {
    x: position.x + deltaPosition.x,
    y: position.y + deltaPosition.y,
    width: sizeInTiles.width,
    height: sizeInTiles.height,
  };

  const halfPlayerWidth = player.width / 2;
  const halfPlayerHeight = player.height / 2;
  const halfWidthInTiles = interactible.width / 2;
  const halfHeightInTiles = interactible.height / 2;

  const collides =
    player.x - halfPlayerWidth < interactible.x + halfWidthInTiles &&
    player.x + halfPlayerWidth > interactible.x - halfWidthInTiles &&
    player.y - halfPlayerHeight < interactible.y + halfHeightInTiles &&
    player.y + halfPlayerHeight > interactible.y - halfHeightInTiles;

  if (!collides) return noCollision;

  const horizontal = player.x - interactible.x;
  const vertical = player.y - interactible.y;

  const left = horizontal > 0;
  const right = horizontal < 0;
  const top = vertical > 0;
  const bottom = vertical < 0;

  const leftCorrection = interactible.x + 0.5 + halfPlayerWidth;
  const rightCorrection = interactible.x - 0.5 - halfPlayerWidth;
  const topCorrection = interactible.y + 0.5 + halfPlayerHeight;
  const bottomCorrection = interactible.y - 0.5 - halfPlayerHeight;

  return {
    isColliding: true,
    left,
    right,
    top,
    bottom,
    correction: new Vector2(left ? leftCorrection : rightCorrection, top ? topCorrection : bottomCorrection),
  } as Collision;
};
