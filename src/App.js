import { useRef, useState, useEffect } from "react";
import { Machine, interpret } from "xstate";

const events = {
  RIDE: "RIDE",
  RIDE_TAXI: "RIDE_TAXI",
  RIDE_BUS: "RIDE_BUS",
  WALK: "WALK"
}

const getHomeMachine = Machine({
  type: 'parallel',
  states: {
    riding_enabled: {
      initial: 'no',
      states: {
        yes: {},
        no: {
          on: {
            [events.RIDE]: 'yes'
          }
        }
      }
    },
    global: {
      initial: 'walking',
      on: {
        [events.RIDE_TAXI]: 'global.riding.taxi',
        [events.RIDE_BUS]: 'global.riding.bus'
      },
      states: {
        idle: {
          on: {
            [events.RIDE]: 'riding',
            [events.WALK]: 'walking'
          }            
        },
        walking: {
          on: {
            [events.RIDE]: 'riding',
            [events.WALK]: 'idle'
          }
        },
        riding: {
          initial: 'bus',
          on: {
            [events.WALK]: 'walking',
            [events.RIDE]: 'idle',
          },
          states: {
            bus: {},
            taxi: {}
          }
        }
      }
    }
  }
});

const useMachine = stateMachine => {
  const [state, setState] = useState()
  const serviceRef = useRef(null);

  if (serviceRef.current === null) {
    serviceRef.current = interpret(stateMachine);
  }

  const send = serviceRef.current.send;

  useEffect(() => {
    serviceRef.current.start();
    serviceRef.current.onTransition(setState);

    return () => {
      serviceRef.current?.stop();
      serviceRef.current = null;
    };
  }, [serviceRef]);

  return [state, send];
}

const App = () => {
  const [state, send] = useMachine(getHomeMachine)

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
              checked={state?.matches('global.walking') ?? false}
              name='walking'
              type="checkbox"
              onChange={() => send(events.WALK)}
            />
            Walking
          </label>
        </div>
        <div>
          <label>
            <input
              checked={state?.matches('global.riding') ?? false}
              name='riding'
              type="checkbox"
              onChange={() => send(events.RIDE)}
            />
            Riding
          </label>
          { state?.matches('riding_enabled.yes') && <div>
            <label>
              <input
                checked={state?.matches('global.riding.bus') ?? false}
                name='ridingBy'
                type="radio"
                value="bus"
                onChange={() => send(events.RIDE_BUS)}
              />
              a bus
            </label>
            <label>
              <input
                checked={state?.matches('global.riding.taxi') ?? false}
                name='ridingBy'
                type="radio"
                value="taxi"
                onChange={() => send(events.RIDE_TAXI)}
              />
              taxi
            </label>
          </div> }
        </div>
      </form>
    </div>
  );
}

export default App;
