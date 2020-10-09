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
  return Array(rows).fill().map(() =>
    Array(columns).fill().map(mapper))
}

const newTicTacToeGrid = () =>
  generateGrid(3, 3, () => null)

function Grid({ grid }) {
  return (
    <div style={{ display: 'inline-block' }}>
      <div
        style={{
          backgroundColor: '#000',
          display: 'grid',
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
          gridGap: 2,
        }}
      >
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
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

// deeply clone array or object
const clone = x => JSON.parse(JSON.stringify(x))

// enum to get next turn
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
      const nextState = clone(state)
      const { grid, turn } = nextState

      // if the cell already has a value, clicking on it should do nothing
      if(grid[y][x]) {
        return state
      }

      grid[y][x] = turn

      nextState.turn = NEXT_TURN[turn]

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
