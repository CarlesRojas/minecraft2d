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
}

const textures = {
  bundles: [
    {
      name: 'blocks',
      assets: [
        { name: TileType.DIRT, srcs: '/texture/block/dirt.png' },
        { name: TileType.GRASS, srcs: '/texture/block/grass_block_side.png' },
        { name: TileType.STONE, srcs: '/texture/block/stone.png' },
        { name: TileType.COAL, srcs: '/texture/block/coal_ore.png' },
        { name: TileType.IRON, srcs: '/texture/block/iron_ore.png' },
        { name: TileType.DIAMOND, srcs: '/texture/block/diamond_ore.png' },
        { name: TileType.ANDESITE, srcs: '/texture/block/andesite.png' },
        { name: TileType.DIORITE, srcs: '/texture/block/diorite.png' },
        { name: TileType.GRANITE, srcs: '/texture/block/granite.png' },
      ],
    },
    {
      name: 'characters',
      assets: [{ name: CharacterType.STEVE, srcs: '/texture/entity/steve_front.png' }],
    },
  ],
};

export const getTileTexture = (name: TileType) => {
  const texture = PIXI.Assets.get(name) as PIXI.Texture;
  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return texture;
};

export const getCharacterTexture = (name: CharacterType) => {
  const texture = PIXI.Assets.get(name) as PIXI.Texture;
  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return texture;
};

export default textures;
