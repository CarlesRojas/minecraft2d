import { Dimensions } from '@game/Controller';
import { CollisionLayer, Interactible, InteractionLayer } from '@game/interface/Interactible';
import { Mono } from '@game/interface/Mono';
import { TileType } from '@game/system/Textures';
import Vector2 from '@game/util/Vector2';
import * as PIXI from 'pixi.js';
import Dirt from './Dirt';
import TileObject from './TileObject';

export interface TileProps {
  coords: Vector2;
  container: PIXI.Container;
  dimensions: Dimensions;
  type: TileType;
  isBackground: boolean;
}

export default class Tile implements Mono, Interactible {
  // GLOBAL
  private _container: PIXI.Container;
  private _dimensions: Dimensions;

  // PROPERTIES
  private _coords: Vector2;
  private _isBackground: boolean;
  private object: (Mono & Interactible) | null = null;
  interactionLayer: InteractionLayer = InteractionLayer.NONE;
  collisionLayer: CollisionLayer = CollisionLayer.NONE;

  // DEBUG
  private _debug = false;
  private _text: PIXI.Text | null = null;

  constructor({ coords, container, dimensions, type, isBackground }: TileProps) {
    this._coords = coords;
    this._container = container;
    this._dimensions = dimensions;
    this._isBackground = isBackground;
    this.interactionLayer = isBackground ? InteractionLayer.BACKGROUND : InteractionLayer.GROUND;
    this.collisionLayer = isBackground ? CollisionLayer.NONE : CollisionLayer.GROUND;

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
    this.object?.destructor();
  }

  // #################################################
  //   HANDLE RESIZE
  // #################################################

  handleResize(dimensions: Dimensions) {
    const { tile } = dimensions;
    if (this._text) this._text.position.set(this._coords.x * tile, this._coords.y * tile);

    this.object?.handleResize(dimensions);
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    this.object?.gameLoop(deltaInSeconds);
  }

  // #################################################
  //   INTERACTIBLE
  // #################################################

  highlight() {
    this.object?.highlight();
  }

  stopHighlighting() {
    this.object?.stopHighlighting();
  }

  interact() {
    this.object?.interact();
  }

  stopInteracting() {
    this.object?.stopInteracting();
  }

  interactSecondary() {
    // TODO place object in this tile if empty and it is not coliding with any entity
    // const collision = isCollidingWithLayers(this.bounds, [CollisionLayer.PLAYER, CollisionLayer.ENTITY], this._global);
    // if (!!collision) return;

    // this.setTile(TileType.DIRT, false);
    this.object?.interactSecondary();
  }

  shouldCollide() {
    return this.object?.shouldCollide() ?? false;
  }

  get bounds() {
    return this.object?.bounds ?? { x: 0, y: 0, width: 0, height: 0 };
  }

  // #################################################
  //   GETTERS
  // #################################################

  get coords() {
    return this._coords;
  }

  // #################################################
  //   OBJECT
  // #################################################

  #instantiateObject(type: TileType) {
    const props: TileProps = {
      coords: this._coords,
      container: this._container,
      dimensions: this._dimensions,
      isBackground: this._isBackground,
      type,
    };
    const handleBreak = this.#destroyObject.bind(this);

    this.#destroyObject();
    this.#setLayers(type);

    if (type === TileType.DIRT || type === TileType.GRASS) this.object = new Dirt(props, handleBreak);
    else this.object = new TileObject(props, handleBreak);
  }

  #destroyObject() {
    this.object?.destructor();
    this.object = null;
  }

  #setLayers(type: TileType) {
    this.interactionLayer = this._isBackground ? InteractionLayer.BACKGROUND : InteractionLayer.GROUND;
    this.collisionLayer = this._isBackground ? CollisionLayer.NONE : CollisionLayer.GROUND;

    if (type === TileType.NONE) {
      this.interactionLayer = InteractionLayer.NONE;
      this.collisionLayer = CollisionLayer.NONE;
    }
  }
}
