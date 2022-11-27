import { Bounds } from '@game/util/EntityTypes';

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
  isInteractable(): boolean;

  shouldCollide(): boolean;

  get bounds(): Bounds; // In tile space
  get occupied(): boolean; // In tile space
}
