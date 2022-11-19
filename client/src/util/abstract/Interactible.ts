import { Bounds } from '@util/EntityTypes';

export abstract class Interactible {
  abstract highlight(): void;
  abstract interact(): void;
  abstract get getBounds(): Bounds;
}
