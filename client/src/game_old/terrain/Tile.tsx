import Vector2 from '@util/Vector2';
import { SEED, TileType } from '@util/constant/constants';
import { getTextureFromTileType, getTileTypeInCoords } from '@util/Terrain';
import { Sprite } from 'react-pixi-fiber';

interface TileProps {
  coords: Vector2;
  tileSize: number;
}

const Tile = ({ coords, tileSize }: TileProps) => {
  const type = getTileTypeInCoords(SEED, coords);
  const texture = getTextureFromTileType(type);

  return (
    texture && (
      <Sprite texture={texture} x={coords.x * tileSize} y={coords.y * tileSize} width={tileSize} height={tileSize} />
    )
  );
};

export default Tile;
