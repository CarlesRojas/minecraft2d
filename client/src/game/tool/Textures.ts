import DirtImage from '@asset/texture/block/dirt.png';
import * as PIXI from 'pixi.js';

export enum TileType {
  NONE = 'none',
  DIRT = 'dirt',
  GRASS = 'grass_block_side',
  STONE = 'stone',
  COAL = 'coal_ore',
  IRON = 'iron_ore',
  DIAMOND = 'diamond_ore',
  ANDESITE = 'andesite',
  DIORITE = 'diorite',
  GRANITE = 'granite',
}

export enum CharacterType {
  STEVE = 'steve',
  ALEX = 'alex',
  MARIO = 'mario',
  PINYA = 'pinya',
  PARTS = 'parts',
}

const textures = {
  bundles: [
    {
      name: 'blocks',
      assets: [
        { name: TileType.DIRT, srcs: DirtImage },
        { name: TileType.GRASS, srcs: 'src/asset/texture/block/grass_block_side.png' },
        { name: TileType.STONE, srcs: 'src/asset/texture/block/stone.png' },
        { name: TileType.COAL, srcs: 'src/asset/texture/block/coal_ore.png' },
        { name: TileType.IRON, srcs: 'src/asset/texture/block/iron_ore.png' },
        { name: TileType.DIAMOND, srcs: 'src/asset/texture/block/diamond_ore.png' },
        { name: TileType.ANDESITE, srcs: 'src/asset/texture/block/andesite.png' },
        { name: TileType.DIORITE, srcs: 'src/asset/texture/block/diorite.png' },
        { name: TileType.GRANITE, srcs: 'src/asset/texture/block/granite.png' },
      ],
    },
    {
      name: 'characters',
      assets: [
        { name: CharacterType.STEVE, srcs: 'src/asset/texture/entity/steve.png' },
        { name: CharacterType.ALEX, srcs: 'src/asset/texture/entity/alex.png' },
        { name: CharacterType.MARIO, srcs: 'src/asset/texture/entity/mario.png' },
        { name: CharacterType.PINYA, srcs: 'src/asset/texture/entity/pinya.png' },
        { name: CharacterType.PARTS, srcs: 'src/asset/texture/entity/parts64.png' },
      ],
    },
  ],
};

export const getTileTexture = (name: TileType) => {
  const texture = PIXI.Assets.get(name) as PIXI.Texture;
  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return texture;
};

export const getCharacterTexture = (name: CharacterType, rectangle?: PIXI.Rectangle) => {
  const texture = PIXI.Assets.get(name) as PIXI.Texture;
  const newTexture = new PIXI.Texture(texture.baseTexture, rectangle);
  newTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

  return newTexture;
};

export default textures;
