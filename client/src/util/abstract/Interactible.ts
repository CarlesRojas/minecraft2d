import { Bounds } from '@util/EntityTypes';

export enum InteractionLayer {
  NONE = 'none',
  PLAYER = 'player',
  ENTITY = 'entity',
  BACKGROUND = 'background',
  GROUND = 'ground',
}

export enum CollisionLayer {
  NONE = 'none',
  PLAYER = 'player',
  ENTITY = 'entity',
  GROUND = 'ground',
}

export interface Interactible {
  interactionLayer: InteractionLayer;
  collisionLayer: CollisionLayer;

  highlight(): void;
  stopHighlighting(): void;

  interact(): void;
  stopInteracting(): void;

  interactSecondary(): void;

  shouldCollide(): boolean;

  get bounds(): Bounds; // In tile space
}
