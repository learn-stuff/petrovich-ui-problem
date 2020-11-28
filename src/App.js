import { useRef, useState, useEffect } from "react";
import { Machine, interpret } from "xstate";

const events = {
  RIDE: "RIDE",
  RIDE_TAXI: "RIDE_TAXI",
  RIDE_BUS: "RIDE_BUS",
  WALK: "WALK"
}

const getHomeMachine = Machine({
  id: 'getHome',
  initial: 'walking',
  states: {
    walking: {
      on: {
        [events.RIDE]: 'riding',
        [events.RIDE_TAXI]: 'riding.taxi',
        [events.RIDE_BUS]: 'riding.bus'
      }
    },
    riding: {
      initial: 'bus',
      on: {
        [events.WALK]: 'walking'
      },
      states: {
        bus: {
          on: {
            [events.RIDE_TAXI]: 'taxi'
          }
        },
        taxi: {
          on: {
            [events.RIDE_BUS]: 'bus'
          }
        }
      }
    }
  }
});

const App = () => {
  const [state, setState] = useState()
  const interpreterRef = useRef(interpret(getHomeMachine).onTransition(setState));
  const interperter = interpreterRef.current;

  useEffect(() => interperter.start(), [interperter]);

  return (
    <div>
      <h1>Get Home After Party</h1>
      <p>
        I'm going by
      </p>
      <form>
        <div>
          <label>
            <input
              checked={state?.matches('walking') ?? false}
              name='walking'
              type="checkbox"
              onChange={() => interperter.send(events.WALK)}
            />
            Walking
          </label>
        </div>
        <div>
          <label>
            <input
              checked={state?.matches('riding') ?? false}
              name='riding'
              type="checkbox"
              onChange={() => interperter.send(events.RIDE)}
            />
            Riding
          </label>
          <div>
            <label>
              <input
                checked={state?.matches('riding.bus') ?? false}
                name='ridingBy'
                type="radio"
                value="bus"
                onChange={() => interperter.send(events.RIDE_BUS)}
              />
              a bus
            </label>
            <label>
              <input
                checked={state?.matches('riding.taxi') ?? false}
                name='ridingBy'
                type="radio"
                value="taxi"
                onChange={() => interperter.send(events.RIDE_TAXI)}
              />
              taxi
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}

export default App;
