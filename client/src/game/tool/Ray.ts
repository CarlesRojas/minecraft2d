import Vector2 from '@util/Vector2';

const STEP = 0.1;

const castRay = (origin: Vector2, direction: Vector2, maxDistance: number, objectsToCheck: []) => {
  const normalizedDirection = direction.normalized;
  const step = Vector2.mul(normalizedDirection, STEP);
  let current = origin;
  let distance = 0;

  while (distance < maxDistance) {
    const collision = checkCollisionInTile(current, normalizedDirection);

    if (collision) {
      console.log(collision);
      return collision;
    }

    current = Vector2.add(current, step);
    distance += STEP;
  }

  return null;
};

const checkCollisionInTile = (coords: Vector2, direction: Vector2) => {
  return false;
};

export default castRay;
