import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartGame from "./components/StartGame";
import Game from "./components/Game";

function App() {
  return (
    <Router>
      <Routes>
        {/* Start game menu */}
        <Route path="/" element={<StartGame />} />

        {/* Game route with mode parameter */}
        <Route
          path="/game/:mode"
          element={<GameWithMode />}
        />
      </Routes>
    </Router>
  );
}

// Wrapper component to get mode from URL params and pass to Game
import { useParams } from "react-router-dom";

const GameWithMode = () => {
  const { mode } = useParams();
  return <Game initialMode={mode || "single"} />;
};

export default App;
