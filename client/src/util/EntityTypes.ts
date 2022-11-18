export interface Entity {
  parts: {
    [key: string]: {
      size: Size;
      origin: Origin;
      anchor: Anchor;
      zIndex: number;
    };
  };
  states: { [key: string]: State };
}

export interface State {
  visibleParts: string[];
  animations: Animation[];
}

export interface Animation {
  speed: number;
  amplidude: number;
  parts: string[];
  type: string;
}

export interface Size {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Origin {
  x: number;
  y: number;
}

export interface Anchor {
  x: number;
  y: number;
}
