import { useState } from 'react';
import { Stage } from 'react-pixi-fiber';
import useResize from '@hook/useResize';
import World from 'src/game_old/terrain/World';
import { HORIZONTAL_TILES_PER_SCREEN } from '@util/constant/constants';
import useCharacter from '@hook/useCharacter';

const Game = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useResize(() => setDimensions({ width: window.innerWidth, height: window.innerHeight }), true);

  const tileSize = dimensions.width / HORIZONTAL_TILES_PER_SCREEN;
  const character = useCharacter(tileSize);

  return (
    <Stage
      options={{
        backgroundColor: 0x91bfff,
        backgroundAlpha: 1,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        ...dimensions,
      }}
      x={dimensions.width * 0.5 - character.position.x}
      y={dimensions.height * 0.5 + character.position.y}
    >
      <World tileSize={tileSize} dimensions={dimensions} characterPosition={character.position} />
    </Stage>
  );
};

export default Game;
