export { AsyncState };
export { IsNotLastUpdate };

type IsNotLastUpdate = () => boolean;
type UpdateFunction = (
  isNotLastUpdate: IsNotLastUpdate
) => void | Promise<void>;
type ValueOf<T> = T[keyof T];

class AsyncState<State extends Object> {
  state: State;
  runUpdate: () => void;

  constructor(initialState: State, update: UpdateFunction) {
    deepFreeze(initialState);
    const stateObject = copy(initialState);
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
        const isNotLastUpdate = () => updateNumber !== lastUpdateNumber;
        if (isNotLastUpdate()) return;
        updatePromise = update(isNotLastUpdate);
      })();
    }
  }
}

function copy<T>(obj: T): T {
  const copy = JSON.parse(JSON.stringify(obj));
  return copy;
}

// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze<T>(object: T): T {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self

  for (const name of propNames) {
    const value = object[name];

    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}
