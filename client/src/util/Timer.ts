export interface TimerOptions {
  resetOnEnd?: boolean;
  callOnStart?: boolean;
}

const defaultOptions: TimerOptions = {
  resetOnEnd: false,
  callOnStart: false,
};

export default class Timer {
  private _running = true;
  private _amountInSeconds: number;
  private _initialAmountInSeconds: number;
  private _resetOnEnd: boolean;
  private _callOnStart: boolean;
  private _callback: () => void;

  constructor(amountInSeconds: number, callback: () => void, options?: TimerOptions) {
    this._amountInSeconds = amountInSeconds;
    this._initialAmountInSeconds = amountInSeconds;
    this._resetOnEnd = options?.resetOnEnd ?? false;
    this._callOnStart = options?.callOnStart ?? false;
    this._callback = callback;
  }

  // #################################################
  //   GAME LOOP
  // #################################################

  gameLoop(deltaInSeconds: number) {
    if (!this._running) return;

    if (this._callOnStart) {
      this._callback();
      this._callOnStart = false;
    }

    this._amountInSeconds -= deltaInSeconds;

    if (this._amountInSeconds <= 0) {
      this._amountInSeconds = 0;
      this._callback();
      this._running = false;

      if (this._resetOnEnd) this.reset();
    }
  }

  // #################################################
  //   GETTERS
  // #################################################

  get amountInSeconds() {
    return this._amountInSeconds;
  }

  get running() {
    return this._running;
  }

  // #################################################
  //   METHODS
  // #################################################

  reset(newAmountInSeconds?: number) {
    if (newAmountInSeconds) this._initialAmountInSeconds = newAmountInSeconds;

    this._amountInSeconds = this._initialAmountInSeconds;
    this._running = true;
  }
}
