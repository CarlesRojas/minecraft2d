import Vector2 from '@game/util/Vector2';
import { useEffect, useRef } from 'react';

const useInsideArea = (id: string) => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    elementRef.current = document.getElementById(id);
  }, [id]);

  const isInsideArea = (coords: Vector2) => {
    if (!elementRef.current) return false;
    const { top, left, width, height } = elementRef.current.getBoundingClientRect();
    return coords.x >= left && coords.x <= left + width && coords.y >= top && coords.y <= top + height;
  };

  return isInsideArea;
};

export default useInsideArea;
