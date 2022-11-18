import { styled } from '@style/stitches.config';
import { useEffect, useRef } from 'react';

const Pointer = styled('div', {
  width: '10px',
  height: '10px',
  boxShadow: '0 0 0 1px black, 0 0 0 3px white, 0 0 0 4px black',
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 100,
  transform: 'translate(-50%, -50%)',
});

const Cursor = () => {
  const cursor = useRef<HTMLDivElement>(null);

  // #################################################
  //   FRAME RATE
  // #################################################

  const handleMousePositionChange = (event: MouseEvent) => {
    cursor.current?.setAttribute('style', 'top: ' + event.pageY + 'px; left: ' + event.pageX + 'px;');
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMousePositionChange);

    return () => {
      document.removeEventListener('mousemove', handleMousePositionChange);
    };
  }, []);

  // #################################################
  //   RENDER
  // #################################################

  return <Pointer ref={cursor}></Pointer>;
};

export default Cursor;
