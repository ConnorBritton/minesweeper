import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Tic Tac Toe in React</h1>
      </header>
      <Game />
    </div>
  );
}

function generateGrid(rows, columns, mapper) {
  return Array(rows)
    .fill()
    .map(() =>
      Array(columns)
        .fill()
        .map(mapper)
    )
}

const newTicTacToeGrid = () => generateGrid(3, 3, () => null)

function Grid({ grid }) {
  return (
    // Wrapping the grid with a div of inline-block means that the grid
    // takes up only the space defined by the size of the cells, while
    // still allowing us to use fractional values for the grid-template-*
    // properties
    <div style={{ display: 'inline-block' }}>
      <div
        style={{
          // We set a background color to be revealed as the lines
          // of the board with the `grid-gap` property
          backgroundColor: '#000',
          display: 'grid',
          // Our rows are equal to the length of our grid
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          // Our columns are equal to the length of a row
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          gridGap: 2,
        }}
      >
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            // We put the colIdx first because that is our X-axis value
            // and the rowIdx second because that is our Y-axis value
            // Getting in the habit makes using 2d grids much easier
            <Cell key={`${colIdx}-${rowIdx}`} cell={cell} />
          ))
        )}
      </div>
    </div>
  )
}

const cellStyle = {
  backgroundColor: '#fff',
  height: 75,
  width: 75,
}

function Cell({ cell, handleClick }) {
  return (
    <div style={cellStyle}>
      <button type="button" onClick={handleClick}>
        {cell}
      </button>
    </div>
  )
}

// Simple way to deeply clone an array or object
const clone = x => JSON.parse(JSON.stringify(x))

// An enum for the next turn in our game
const NEXT_TURN = {
  O: 'X',
  X: 'O',
}

const initialState = {
  grid: newTicTacToeGrid(),
  turn: 'X',
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'CLICK': {
      const { x, y } = action.payload
      // Since we need immutable updates, I often find the simplest thing to do
      // is to clone the current state, and then use mutations on the clone to
      // make updates for the next state
      const nextState = clone(state)
      const { grid, turn } = nextState

      // If the cell already has a value, clicking on it should do nothing
      // Also, pay attention, because our rows are first, the `y` value is the
      // first index, the `x` value second. This takes some getting used to.
      if (grid[y][x]) {
        return state
      }

      // If we're here in our program, we can assign this cell to the current
      // `turn` value
      grid[y][x] = turn

      // Now that we've used this turn, we need to set the next turn. It might
      // be overkill, but I've used an object enum to do this.
      nextState.turn = NEXT_TURN[turn]

      // We'll add checks for winning or drawing soon

      return nextState
    }

    default:
      return state
  }
}

function Game() {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { grid } = state

  const handleClick = (x, y) => {
    dispatch({ type: 'CLICK', payload: { x, y } })
  }

  return <Grid grid={grid} />
}

export default App;
