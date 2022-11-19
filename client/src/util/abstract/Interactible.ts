import { Bounds } from '@util/EntityTypes';

export enum InteractionLayer {
  AIR = 'air',
  BACKGROUND = 'background',
  GROUND = 'ground',
}

export interface Interactible {
  interactionLayer: InteractionLayer;
  highlight(): void;
  stopHighlighting(): void;
  interact(): void;
  stopInteracting(): void;
  get getBounds(): Bounds; // In tile space
}
