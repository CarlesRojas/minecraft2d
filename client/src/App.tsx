import Cursor from '@component/Cursor';
import DevToolsUI from '@component/DevToolsUI';
import { HORIZONTAL_TILES_PER_SCREEN } from '@game/constant/constants';
import Controller from '@game/Controller';
import useDidMount from '@hook/useDidMount';
import useResize from '@hook/useResize';
import globalStyles from '@style/global';
import { styled } from '@style/stitches.config';
import { Event, useEvents } from '@util/Events';
import Vector2 from '@util/Vector2';
import { useEffect, useRef, useState } from 'react';

const getGameDimensions = (dimensions: Vector2) => ({
  screen: dimensions,
  tile: dimensions.x / HORIZONTAL_TILES_PER_SCREEN,
});

const Game = styled('main', {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

const App = () => {
  globalStyles();
  const events = useEvents();

  // #################################################
  //   GAME CONTAINER
  // #################################################

  const container = useRef<HTMLElement>(null);

  // #################################################
  //   BOARD DIMENSIONS
  // #################################################

  const [dimensions, setDimensions] = useState(new Vector2(0, 0));
  useResize(() => setDimensions(new Vector2(window.innerWidth, window.innerHeight)), true);

  // #################################################
  //   CONTROLLER
  // #################################################

  const controller = useRef<Controller | null>(null);

  useDidMount(() => {
    if (!container.current) return;
    controller.current = new Controller({
      container: container.current,
      dimensions: getGameDimensions(dimensions),
      events,
    });
  });

  useEffect(() => {
    if (controller.current) controller.current.handleResize(getGameDimensions(dimensions));
  }, [dimensions]);

  // #################################################
  //   CAPTURE EVENTS
  // #################################################

  const handleMouseMove = (e: MouseEvent) => events.emit(Event.ON_MOUSE_MOVE, e);
  const handleKeyDown = (e: KeyboardEvent) => events.emit(Event.ON_KEY_DOWN, e);
  const handleKeyUp = (e: KeyboardEvent) => events.emit(Event.ON_KEY_UP, e);
  const handleMouseDown = (e: MouseEvent) => events.emit(Event.ON_MOUSE_DOWN, e);
  const handleMouseUp = (e: MouseEvent) => events.emit(Event.ON_MOUSE_UP, e);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <>
      <DevToolsUI />
      <Cursor />
      <Game ref={container} />
    </>
  );
};

export default App;
