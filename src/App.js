import { useState, useRef, useCallback, useEffect } from "react";
import * as yup from "yup";
import Form from "react-formal";
import { Machine, interpret } from "xstate";

const events = {
  RIDE: "RIDE",
  RIDE_TAXI: "RIDE_TAXI",
  RIDE_BUS: "RIDE_BUS",
  WALK: "WALK"
}

const schema = yup.object({
  walking: yup.bool(),
  riding: yup.bool(),
  ridingBy: yup.string(),
});

const getHomeMachine = ({ actions }) => Machine({
  id: 'getHome',
  initial: 'walking',
  states: {
    walking: {
      on: {
        [events.RIDE]: 'riding',
        [events.RIDE_TAXI]: 'riding.taxi',
        [events.RIDE_BUS]: 'riding.bus'
      },
      entry: ["setWalking"]
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
          },
          entry: ["setRidingBus"]
        },
        taxi: {
          on: {
            [events.RIDE_BUS]: 'bus'
          },
          entry: ["setRidingTaxi"]
        }
      }
    }
  }
}, {
  actions
});

const App = () => {
  const [model, setModel] = useState({});

  const setWalking = useCallback(() => setModel({ walking: true, riding: false, ridingBy: "" }), [setModel])
  const setRidingBus = useCallback(() => setModel({ walking: false, riding: true, ridingBy: "bus" }), [setModel])
  const setRidingTaxi = useCallback(() => setModel({ walking: false, riding: true, ridingBy: "taxi" }), [setModel])

  const stateRef = useRef(
    interpret(getHomeMachine({
      actions: {
        setWalking,
        setRidingBus,
        setRidingTaxi
      }
    }))
  );
  const state = stateRef.current;

  useEffect(() => state.start(), [state]);

  return (
    <div>
      <h1>Get Home After Party</h1>
      <p>
        I'm going by
      </p>
      <Form
        schema={schema}
        value={model}
      >
        <div>
          <label>
            <Form.Field name='walking' type="checkbox" onChange={() => state.send(events.WALK)} />
            Walking
          </label>
        </div>
        <div>
          <label>
            <Form.Field name='riding' type="checkbox" onChange={() => state.send(events.RIDE)} />
            Riding
          </label>
          <div>
            <label>
              <Form.Field name='ridingBy' type="radio" value="bus" onChange={() => state.send(events.RIDE_BUS)} />
              a bus
            </label>
            <label>
              <Form.Field name='ridingBy' type="radio" value="taxi" onChange={() => state.send(events.RIDE_TAXI)} />
              taxi
            </label>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default App;
