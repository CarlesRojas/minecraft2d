import Vector2 from '@util/Vector2';
import { useMemo } from 'react';

const useCharacter = (tileSize: number) => {
  const position = useMemo(() => new Vector2(0 * tileSize, 0 * tileSize), [tileSize]);
  return { position };
};

export default useCharacter;
