import { getRenderedTiles } from '@game/tools/Terrain';
import Vector2 from '@util/Vector2';
import { useMemo } from 'react';
import Tile from './Tile';

interface WorldProps {
  tileSize: number;
  dimensions: { width: number; height: number };
  characterPosition: Vector2;
}

const World = ({ tileSize, dimensions, characterPosition }: WorldProps) => {
  const grid = useMemo(() => getRenderedTiles(tileSize, dimensions), [tileSize, dimensions, characterPosition]);

  return <>{grid && grid.map((coords) => <Tile key={coords.toString()} coords={coords} tileSize={tileSize} />)}</>;
};

export default World;
