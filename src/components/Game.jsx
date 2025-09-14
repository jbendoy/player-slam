import React, { useState, useEffect, useRef, useCallback } from "react";

const Game = () => {
  const arenaWidth = 600;
  const arenaHeight = 400;
  const moveSpeed = 5;

  const ellipseCenterX = arenaWidth / 2;
  const ellipseCenterY = arenaHeight / 2;
  const ellipseRadiusX = 220;
  const ellipseRadiusY = 150;

  const spriteWidth = 50;
  const spriteHeight = 50;
  const numFrames = 4;
  const animationFrameDuration = 100;

  // Sprite sheet rows: 0=down, 1=right, 2=left, 3=up
  const directionMap = {
    down: 0,
    right: 1,
    left: 2,
    up: 3,
  };

  const [player1, setPlayer1] = useState({
    x: ellipseCenterX - 100,
    y: ellipseCenterY,
    lives: 3,
    direction: "down",
    frame: 0,
    lastFrameUpdateTime: 0,
  });

  const [player2, setPlayer2] = useState({
    x: ellipseCenterX + 50,
    y: ellipseCenterY,
    lives: 3,
    direction: "down",
    frame: 0,
    lastFrameUpdateTime: 0,
  });

  const [winner, setWinner] = useState("");
  const [flashP1, setFlashP1] = useState(false);
  const [flashP2, setFlashP2] = useState(false);

  const keysPressed = useRef({});
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const isPlayerOutOfBounds = useCallback(
    (player) => {
      const playerCenterX = player.x + spriteWidth / 2;
      const playerCenterY = player.y + spriteHeight / 2;
      const dx = playerCenterX - ellipseCenterX;
      const dy = playerCenterY - ellipseCenterY;
      return (
        (dx * dx) / (ellipseRadiusX * ellipseRadiusX) +
          (dy * dy) / (ellipseRadiusY * ellipseRadiusY) >
        1
      );
    },
    [ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      e.preventDefault();
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (winner) {
      cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const gameLoop = (timestamp) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;

      const updatePlayer = (p, upKey, downKey, leftKey, rightKey) => {
        let newPos = { ...p };
        let newDirection = p.direction;
        let moving = false;

        if (keysPressed.current[upKey]) {
          newPos.y -= moveSpeed;
          newDirection = "up";
          moving = true;
        }
        if (keysPressed.current[downKey]) {
          newPos.y += moveSpeed;
          newDirection = "down";
          moving = true;
        }
        if (keysPressed.current[leftKey]) {
          newPos.x -= moveSpeed;
          newDirection = "left";
          moving = true;
        }
        if (keysPressed.current[rightKey]) {
          newPos.x += moveSpeed;
          newDirection = "right";
          moving = true;
        }

        let newFrame = p.frame;
        let newLastFrameUpdateTime = p.lastFrameUpdateTime;

        if (moving && timestamp - p.lastFrameUpdateTime >= animationFrameDuration) {
          newFrame = (p.frame + 1) % numFrames;
          newLastFrameUpdateTime = timestamp;
        } else if (!moving) {
          newFrame = 0;
          newLastFrameUpdateTime = timestamp;
        }

        return {
          ...newPos,
          direction: newDirection,
          frame: newFrame,
          lastFrameUpdateTime: newLastFrameUpdateTime,
        };
      };

      setPlayer1((p) => updatePlayer(p, "w", "s", "a", "d"));
      setPlayer2((p) =>
        updatePlayer(p, "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight")
      );

      lastUpdateRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [winner]);

  useEffect(() => {
    if (winner) return;
    if (
      Math.abs(player1.x - player2.x) < spriteWidth &&
      Math.abs(player1.y - player2.y) < spriteHeight
    ) {
      const pushStep = 2;
      setPlayer1((p) => ({
        ...p,
        x: p.x - pushStep,
        y: p.y + (Math.random() > 0.5 ? -2 : 2),
      }));
      setPlayer2((p) => ({
        ...p,
        x: p.x + pushStep,
        y: p.y + (Math.random() > 0.5 ? 2 : -2),
      }));
    }
  }, [player1.x, player1.y, player2.x, player2.y, winner]);

  useEffect(() => {
    if (winner) return;

    if (isPlayerOutOfBounds(player1)) {
      if (player1.lives > 1) {
        setPlayer1({
          ...player1,
          lives: player1.lives - 1,
          x: ellipseCenterX - 100,
          y: ellipseCenterY,
          direction: "down",
          frame: 0,
          lastFrameUpdateTime: 0,
        });
        setFlashP1(true);
        setTimeout(() => setFlashP1(false), 200);
      } else setWinner("Player 2 Wins!");
    }

    if (isPlayerOutOfBounds(player2)) {
      if (player2.lives > 1) {
        setPlayer2({
          ...player2,
          lives: player2.lives - 1,
          x: ellipseCenterX + 50,
          y: ellipseCenterY,
          direction: "down",
          frame: 0,
          lastFrameUpdateTime: 0,
        });
        setFlashP2(true);
        setTimeout(() => setFlashP2(false), 200);
      } else setWinner("Player 1 Wins!");
    }
  }, [player1, player2, winner, isPlayerOutOfBounds]);

  const restartGame = () => {
    setPlayer1({
      x: ellipseCenterX - 100,
      y: ellipseCenterY,
      lives: 3,
      direction: "down",
      frame: 0,
      lastFrameUpdateTime: 0,
    });
    setPlayer2({
      x: ellipseCenterX + 50,
      y: ellipseCenterY,
      lives: 3,
      direction: "down",
      frame: 0,
      lastFrameUpdateTime: 0,
    });
    setWinner("");
  };

  const renderPlayer = (player, flash, src) => (
    <div
      style={{
        position: "absolute",
        top: player.y,
        left: player.x,
        width: spriteWidth,
        height: spriteHeight,
        backgroundImage: `url(${src})`,
        backgroundSize: `${spriteWidth * numFrames}px ${spriteHeight * numFrames}px`,
        backgroundPosition: `-${player.frame * spriteWidth}px -${
          directionMap[player.direction] * spriteHeight
        }px`,
        filter: flash
          ? "brightness(2) saturate(2) hue-rotate(-50deg)"
          : "none",
        transition: "filter 0.1s",
        imageRendering: "pixelated",
      }}
    />
  );

  return (
    <div style={{ textAlign: "center" }}>
      <h2>
        Player 1 Lives: {player1.lives} | Player 2 Lives: {player2.lives}
      </h2>
      {winner && <h1 style={{ color: "green" }}>{winner}</h1>}
      {winner && (
        <button
          onClick={restartGame}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Restart Game
        </button>
      )}

      <div
        style={{
          width: arenaWidth,
          height: arenaHeight,
          border: "4px solid darkred",
          margin: "0 auto",
          position: "relative",
          backgroundImage: "url(/assets/bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: ellipseCenterY - ellipseRadiusY,
            left: ellipseCenterX - ellipseRadiusX,
            width: ellipseRadiusX * 2,
            height: ellipseRadiusY * 2,
            border: "4px solid rgba(255,165,0,0.4)",
            borderRadius: "50%",
            boxSizing: "border-box",
          }}
        />
        {renderPlayer(player1, flashP1, "/assets/p1.png")}
        {renderPlayer(player2, flashP2, "/assets/p2.png")}
      </div>
    </div>
  );
};

export default Game;
