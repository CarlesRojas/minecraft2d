import { Bounds } from '@util/EntityTypes';

export enum InteractionLayer {
  NONE = 'none',
  BACKGROUND = 'background',
  GROUND = 'ground',
}

export enum CollisionLayer {
  NONE = 'none',
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
