import { Dimensions, Global } from '@game/Controller';
import { CollisionLayer, Interactible, InteractionLayer } from '@game/interface/Interactible';
import { Mono } from '@game/interface/Mono';
import { isCollidingWithLayers } from '@game/system/Collision';
import { TileType } from '@game/system/Textures';
import Vector2 from '@game/util/Vector2';
import * as PIXI from 'pixi.js';
import Dirt from './Dirt';
import TileObject from './TileObject';

export interface TileProps {
  global: Global;
  coords: Vector2;
  container: PIXI.Container;
  dimensions: Dimensions;
  type: TileType;
  isBackground: boolean;
}

export default class Tile implements Mono, Interactible {
  // GLOBAL
  private _global: Global;
  private _container: PIXI.Container;
  private _dimensions: Dimensions;

  // PROPERTIES
  private _coords: Vector2;
  private _isBackground: boolean;
  private _object: TileObject | null = null;

  // DEBUG
  private _debug = false;
  private _text: PIXI.Text | null = null;

  constructor({ global, coords, container, dimensions, type, isBackground }: TileProps) {
    this._global = global;
    this._coords = coords;
    this._container = container;
    this._dimensions = dimensions;
    this._isBackground = isBackground;

    this.#instantiateObject(type);

    if (this._debug) {
      this._text = new PIXI.Text(this._coords.toString(), { fill: 0x00ff00, fontSize: 14 });
      this._text.anchor.set(0.5);
      this._text.zIndex = 1;
      this._container.addChild(this._text);
    }

    this.handleResize(this._dimensions);
  }

  destructor() {
    if (this._text) this._container.removeChild(this._text);
    this._object?.destructor();
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;
    if (this._text) this._text.position.set(this._coords.x * tile, this._coords.y * tile);

    this._object?.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this._object?.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   INTERACTIBLE
  // #################################################

  highlight() {
    this._object?.highlight();
  }

  stopHighlighting() {
    this._object?.stopHighlighting();
  }

  interact() {
    this._object?.interact();
  }

  stopInteracting() {
    this._object?.stopInteracting();
  }

  interactSecondary() {
    if (this.isInteractable()) this._object?.interactSecondary();
    else if (!this.occupied) {
      const collision = isCollidingWithLayers(
        this.bounds,
        [CollisionLayer.PLAYER, CollisionLayer.ENTITY],
        this._global
      );

      // TODO Use object in the player's hand instead of dirt
      if (!collision) this.#instantiateObject(TileType.DIRT);
    }

    this._object?.interactSecondary();
  }

  isInteractable() {
    return this._object?.isInteractable() ?? false;
  }

  shouldCollide() {
    return this._object?.shouldCollide() ?? false;
  }

  get bounds() {
    return this._object?.bounds ?? { x: this.coords.x - 0.5, y: this.coords.y - 0.5, width: 1, height: 1 };
  }

  get occupied() {
    return (this._object && this._object.occupied) ?? false;
  }

  get interactionLayer() {
    return this._object?.interactionLayer ?? InteractionLayer.NONE;
  }

  get collisionLayer() {
    return this._object?.collisionLayer ?? CollisionLayer.NONE;
  }

  // #################################################
  //   GETTERS
  // #################################################

  get coords() {
    return this._coords;
  }

  get type() {
    return this._object?.type ?? TileType.NONE;
  }

  // #################################################
  //   OBJECT
  // #################################################

  #instantiateObject(type: TileType) {
    const props: TileProps = {
      global: this._global,
      coords: this._coords,
      container: this._container,
      dimensions: this._dimensions,
      isBackground: this._isBackground,
      type,
    };

    const handleBreak = this.#destroyObject.bind(this);

    this.#destroyObject();

    if (type === TileType.DIRT || type === TileType.GRASS) this._object = new Dirt(props, handleBreak);
    else this._object = new TileObject(props, handleBreak);
  }

  #destroyObject() {
    this._object?.destructor();
    this._object = null;
  }
}
