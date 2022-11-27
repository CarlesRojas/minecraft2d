import AndesiteImage from '@asset/texture/block/andesite.png';
import BedrockImage from '@asset/texture/block/bedrock.png';
import NetherockImage from '@asset/texture/block/blackstone_top.png';
import CoalOreImage from '@asset/texture/block/coal_ore.png';
import DeepslateImage from '@asset/texture/block/deepslate.png';
import DestroyStage0Image from '@asset/texture/block/destroy_stage_0.png';
import DestroyStage1Image from '@asset/texture/block/destroy_stage_1.png';
import DestroyStage2Image from '@asset/texture/block/destroy_stage_2.png';
import DestroyStage3Image from '@asset/texture/block/destroy_stage_3.png';
import DestroyStage4Image from '@asset/texture/block/destroy_stage_4.png';
import DestroyStage5Image from '@asset/texture/block/destroy_stage_5.png';
import DestroyStage6Image from '@asset/texture/block/destroy_stage_6.png';
import DestroyStage7Image from '@asset/texture/block/destroy_stage_7.png';
import DestroyStage8Image from '@asset/texture/block/destroy_stage_8.png';
import DestroyStage9Image from '@asset/texture/block/destroy_stage_9.png';
import DiamondOreImage from '@asset/texture/block/diamond_ore.png';
import DioriteImage from '@asset/texture/block/diorite.png';
import DirtImage from '@asset/texture/block/dirt.png';
import EndStoneImage from '@asset/texture/block/end_stone.png';
import GraniteImage from '@asset/texture/block/granite.png';
import GrassBlockSideImage from '@asset/texture/block/grass_block_side.png';
import IronOreImage from '@asset/texture/block/iron_ore.png';
import NetherrackImage from '@asset/texture/block/netherrack.png';
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
  DEEPSLATE = 'deepslate',
  NETHEROCK = 'netherock',
  NETHERRACK = 'netherrack',
  BEDROCK = 'bedrock',
  END_STONE = 'end_stone',
  COAL = 'coal_ore',
  IRON = 'iron_ore',
  DIAMOND = 'diamond_ore',
  ANDESITE = 'andesite',
  DIORITE = 'diorite',
  GRANITE = 'granite',
  DESTROY_STATE_0 = 'destroy_stage_0',
  DESTROY_STATE_1 = 'destroy_stage_1',
  DESTROY_STATE_2 = 'destroy_stage_2',
  DESTROY_STATE_3 = 'destroy_stage_3',
  DESTROY_STATE_4 = 'destroy_stage_4',
  DESTROY_STATE_5 = 'destroy_stage_5',
  DESTROY_STATE_6 = 'destroy_stage_6',
  DESTROY_STATE_7 = 'destroy_stage_7',
  DESTROY_STATE_8 = 'destroy_stage_8',
  DESTROY_STATE_9 = 'destroy_stage_9',
}

export enum EntityType {
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
        { name: TileType.DEEPSLATE, srcs: DeepslateImage },
        { name: TileType.NETHEROCK, srcs: NetherockImage },
        { name: TileType.NETHERRACK, srcs: NetherrackImage },
        { name: TileType.BEDROCK, srcs: BedrockImage },
        { name: TileType.END_STONE, srcs: EndStoneImage },
        { name: TileType.COAL, srcs: CoalOreImage },
        { name: TileType.IRON, srcs: IronOreImage },
        { name: TileType.DIAMOND, srcs: DiamondOreImage },
        { name: TileType.ANDESITE, srcs: AndesiteImage },
        { name: TileType.DIORITE, srcs: DioriteImage },
        { name: TileType.GRANITE, srcs: GraniteImage },
        { name: TileType.DESTROY_STATE_0, srcs: DestroyStage0Image },
        { name: TileType.DESTROY_STATE_1, srcs: DestroyStage1Image },
        { name: TileType.DESTROY_STATE_2, srcs: DestroyStage2Image },
        { name: TileType.DESTROY_STATE_3, srcs: DestroyStage3Image },
        { name: TileType.DESTROY_STATE_4, srcs: DestroyStage4Image },
        { name: TileType.DESTROY_STATE_5, srcs: DestroyStage5Image },
        { name: TileType.DESTROY_STATE_6, srcs: DestroyStage6Image },
        { name: TileType.DESTROY_STATE_7, srcs: DestroyStage7Image },
        { name: TileType.DESTROY_STATE_8, srcs: DestroyStage8Image },
        { name: TileType.DESTROY_STATE_9, srcs: DestroyStage9Image },
      ],
    },
    {
      name: 'entities',
      assets: [
        { name: EntityType.STEVE, srcs: SteveImage },
        { name: EntityType.ALEX, srcs: AlexImage },
        { name: EntityType.PINYA, srcs: PinyaImage },
        { name: EntityType.MARIO, srcs: MarioImage },
        { name: EntityType.PARTS, srcs: PartsImage },
      ],
    },
  ],
};

export const getTileTexture = (name: TileType) => {
  const texture = PIXI.Assets.get(name) as PIXI.Texture;
  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return texture;
};

export const getEntityTexture = (name: EntityType, rectangle?: PIXI.Rectangle) => {
  const texture = PIXI.Assets.get(name) as PIXI.Texture;
  const newTexture = new PIXI.Texture(texture.baseTexture, rectangle);
  newTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

  return newTexture;
};

export default textures;
