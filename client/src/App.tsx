import { useEffect, useRef, useState } from 'react';
import DevToolsUI from '@component/DevToolsUI';
import Controller from '@game/Controller';
import useDidMount from '@hook/useDidMount';
import useResize from '@hook/useResize';
import Vector2 from '@util/Vector2';
import { Event, useEvents } from '@util/Events';
import s from '@style/App.module.scss';
import { HORIZONTAL_TILES_PER_SCREEN } from '@game/constant/constants';

const getGameDimensions = (dimensions: Vector2) => ({
  screen: dimensions,
  tile: dimensions.x / HORIZONTAL_TILES_PER_SCREEN,
});

const App = () => {
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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // #################################################
  //   RENDER
  // #################################################

  return (
    <>
      <DevToolsUI />
      <main className={s.game} ref={container} />
    </>
  );
};

export default App;
