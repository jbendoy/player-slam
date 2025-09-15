import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const arenaWidth = 600;
const arenaHeight = 400;

const instructionsText = ` WWelcome to Edge Clash Game!

How to Play:
- Player 1 uses W, A, S, D keys to move.
- Player 2 uses Arrow keys (Multiplayer) or AI (Single Player).
- Stay inside the arena and don’t lose all your lives.
- Push your opponent out of the arena to win!  `;

const StartGame = () => {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [typingFinished, setTypingFinished] = useState(false);
  const [scale, setScale] = useState(1);

  // Responsive scaling
  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / arenaWidth;
      const scaleY = window.innerHeight / arenaHeight;
      setScale(Math.min(scaleX, scaleY));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!showInstructions) return;

    setTypewriterText("");
    setTypingFinished(false);
    let i = 0;

    const interval = setInterval(() => {
      setTypewriterText((prev) => prev + instructionsText[i]);
      i++;
      if (i >= instructionsText.length) {
        clearInterval(interval);
        setTypingFinished(true);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [showInstructions]);

  const handleStart = (mode) => {
    navigate(`/game/${mode}`);
  };

  const buttonStyle = {
    padding: "15px 30px",
    fontSize: 20,
    backgroundColor: "#f7e14b", // yellow
    border: "2px solid #ff8c00", // orange border
    borderRadius: 10,
    cursor: "pointer",
    color: "#000", // black font
    fontWeight: "bold",
    transition: "all 0.2s",
  };

  return (
    <div
      style={{
        width: arenaWidth,
        height: arenaHeight,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        backgroundImage: "url(/assets/start_bg.png)",
        backgroundSize: "cover",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <h1 style={{ fontSize: 40, marginBottom: 20 }}></h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          alignItems: "center",
        }}
      >
        {/* Play button */}
        <button
          onClick={() => handleStart("single")}
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          Play
        </button>

        {/* Instructions button */}
        <button
          onClick={() => setShowInstructions(true)}
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          Instructions
        </button>
      </div>

      {/* Instructions modal */}
      {showInstructions && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxHeight: "80%",
            overflowY: "auto",
            backgroundColor: "#f7e14b", // yellow
            padding: 25,
            borderRadius: 15,
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            zIndex: 10,
            textAlign: "left",
            fontFamily: "monospace",
            color: "#000", // black font
          }}
        >
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, margin: 0 }}>
            {typewriterText}
          </p>

          {typingFinished && (
            <button
              onClick={() => setShowInstructions(false)}
              style={{
                marginTop: 20,
                padding: "10px 25px",
                fontSize: 16,
                fontWeight: "bold",
                borderRadius: 8,
                border: "2px solid #ff8c00", // orange border
                cursor: "pointer",
                backgroundColor: "#f7e14b",
                color: "#000",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              OK
            </button>
          )}
        </div>
      )}

      {/* Typewriter cursor */}
      <style>
        {`
          p::after {
            content: '|';
            animation: blink 1s steps(1) infinite;
          }
          @keyframes blink {
            0%, 50% { opacity: 1; }
            50.01%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default StartGame;
