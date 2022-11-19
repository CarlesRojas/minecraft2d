import { Bounds } from '@util/EntityTypes';

export enum InteractionLayer {
  AIR = 'air',
  BACKGROUND = 'background',
  GROUND = 'ground',
}

export interface Interactible {
  interactionLayer: InteractionLayer;
  highlight(): void;
  unhighlight(): void;
  interact(): void;
  get getBounds(): Bounds; // In tile space
}
