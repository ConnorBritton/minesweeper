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

function Game() {
  const grid = newTicTacToeGrid()
  console.log(grid)
  return <div>Game</div>
}

export default App;
