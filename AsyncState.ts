export { AsyncState };
export { IsLastUpdate };

type IsLastUpdate = () => boolean;
type UpdateFunction = (isLastUpdate: IsLastUpdate) => void | Promise<void>;
type ValueOf<T> = T[keyof T];

class AsyncState<State extends object> {
  state: State;
  runUpdate: () => void;

  constructor(update: UpdateFunction) {
    const stateObject: State = {} as State;
    this.state = new Proxy<State>(stateObject, { set });
    this.runUpdate = runUpdate;

    let lastUpdateNumber = 0;
    let updatePromise: void | Promise<void>;

    return this;

    function set(_: State, prop: keyof State, val: ValueOf<State>) {
      stateObject[prop] = val;
      runUpdate();
      return true;
    }

    function runUpdate() {
      const updateNumber = (lastUpdateNumber = lastUpdateNumber + 1);
      (async () => {
        await updatePromise;
        const isLastUpdate = () => updateNumber === lastUpdateNumber;
        if (!isLastUpdate()) return;
        updatePromise = update(isLastUpdate);
      })();
    }
  }
}
