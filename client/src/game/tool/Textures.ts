import AndesiteImage from '@asset/texture/block/andesite.png';
import CoalOreImage from '@asset/texture/block/coal_ore.png';
import DiamondOreImage from '@asset/texture/block/diamond_ore.png';
import DioriteImage from '@asset/texture/block/diorite.png';
import DirtImage from '@asset/texture/block/dirt.png';
import GraniteImage from '@asset/texture/block/granite.png';
import GrassBlockSideImage from '@asset/texture/block/grass_block_side.png';
import IronOreImage from '@asset/texture/block/iron_ore.png';
import StoneImage from '@asset/texture/block/stone.png';

import AlexImage from '@asset/texture/entity/alex.png';
import MarioImage from '@asset/texture/entity/mario.png';
import PartsImage from '@asset/texture/entity/parts64.png';
import PinyaImage from '@asset/texture/entity/pinya.png';
import SteveImage from '@asset/texture/entity/steve.png';

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
        { name: TileType.GRASS, srcs: GrassBlockSideImage },
        { name: TileType.STONE, srcs: StoneImage },
        { name: TileType.COAL, srcs: CoalOreImage },
        { name: TileType.IRON, srcs: IronOreImage },
        { name: TileType.DIAMOND, srcs: DiamondOreImage },
        { name: TileType.ANDESITE, srcs: AndesiteImage },
        { name: TileType.DIORITE, srcs: DioriteImage },
        { name: TileType.GRANITE, srcs: GraniteImage },
      ],
    },
    {
      name: 'characters',
      assets: [
        { name: CharacterType.STEVE, srcs: AlexImage },
        { name: CharacterType.ALEX, srcs: MarioImage },
        { name: CharacterType.MARIO, srcs: PartsImage },
        { name: CharacterType.PINYA, srcs: PinyaImage },
        { name: CharacterType.PARTS, srcs: SteveImage },
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
