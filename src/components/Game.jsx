import React, { useState, useEffect, useRef, useCallback } from "react";

const arenaWidth = 600;
const arenaHeight = 400;
const spriteWidth = 50;
const spriteHeight = 50;
const numFrames = 4;
const animationFrameDuration = 100;
const moveSpeed = 5;
const aiSpeed = 2; // slower for natural AI

const directionMap = {
    down: 0,
    right: 1,
    left: 2,
    up: 3
};

const Game = () => {
    const [mode, setMode] = useState(null); // null = show start screen
    const [scale, setScale] = useState(1);
    const [player1, setPlayer1] = useState({});
    const [player2, setPlayer2] = useState({});
    const [winner, setWinner] = useState("");
    const [flashP1, setFlashP1] = useState(false);
    const [flashP2, setFlashP2] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState("");
    const keysPressed = useRef({});
    const animationFrameRef = useRef(null);
    const lastUpdateRef = useRef(0);

    // Initialize players
    const initPlayers = () => {
        setPlayer1({
            x: arenaWidth / 2 - 100,
            y: arenaHeight / 2,
            vx: 0,
            vy: 0,
            lives: 3,
            direction: "down",
            frame: 0,
            lastFrameUpdateTime: 0,
        });
        setPlayer2({
            x: arenaWidth / 2 + 50,
            y: arenaHeight / 2,
            vx: 0,
            vy: 0,
            lives: 3,
            direction: "down",
            frame: 0,
            lastFrameUpdateTime: 0,
        });
        setWinner("");
    };

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

    // Keyboard input
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

    // Start game with countdown
    const startGame = (selectedMode) => {
        setMode(selectedMode);
        initPlayers();
        setShowCountdown(true);
        let count = 3;
        setCountdown("3");
        const interval = setInterval(() => {
            count--;
            if (count === 0) {
                setCountdown("Go!");
            } else if (count < 0) {
                setShowCountdown(false);
                clearInterval(interval);
            } else {
                setCountdown(count.toString());
            }
        }, 1000);
    };

    // Collision and arena bounds
    const isOutOfBounds = useCallback((player) => {
        const dx = player.x + spriteWidth / 2 - arenaWidth / 2;
        const dy = player.y + spriteHeight / 2 - arenaHeight / 2;
        const radiusX = 220;
        const radiusY = 150;
        return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) > 1;
    }, []);

    // Game Loop
    useEffect(() => {
        if (!mode || winner || showCountdown) return;

        const gameLoop = (timestamp) => {
            if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;

            // Player 1 keyboard
            setPlayer1((p) => {
                let newPos = { ...p };
                let newDir = p.direction;
                let moving = false;
                if (keysPressed.current["w"]) {
                    newPos.y -= moveSpeed;
                    newDir = "up";
                    moving = true;
                }
                if (keysPressed.current["s"]) {
                    newPos.y += moveSpeed;
                    newDir = "down";
                    moving = true;
                }
                if (keysPressed.current["a"]) {
                    newPos.x -= moveSpeed;
                    newDir = "left";
                    moving = true;
                }
                if (keysPressed.current["d"]) {
                    newPos.x += moveSpeed;
                    newDir = "right";
                    moving = true;
                }

                let newFrame = p.frame;
                let lastTime = p.lastFrameUpdateTime;
                if (moving && timestamp - lastTime >= animationFrameDuration) {
                    newFrame = (p.frame + 1) % numFrames;
                    lastTime = timestamp;
                } else if (!moving) {
                    newFrame = 0;
                    lastTime = timestamp;
                }
                return { ...newPos, direction: newDir, frame: newFrame, lastFrameUpdateTime: lastTime };
            });

            // Player 2: AI or multiplayer
            if (mode === "multi") {
                setPlayer2((p) => {
                    let newPos = { ...p };
                    let newDir = p.direction;
                    if (keysPressed.current["ArrowUp"]) {
                        newPos.y -= moveSpeed;
                        newDir = "up";
                    }
                    if (keysPressed.current["ArrowDown"]) {
                        newPos.y += moveSpeed;
                        newDir = "down";
                    }
                    if (keysPressed.current["ArrowLeft"]) {
                        newPos.x -= moveSpeed;
                        newDir = "left";
                    }
                    if (keysPressed.current["ArrowRight"]) {
                        newPos.x += moveSpeed;
                        newDir = "right";
                    }
                    return { ...newPos, direction: newDir };
                });
            } else {
                // AI chasing player1
                setPlayer2((p) => {
                    const dx = player1.x - p.x;
                    const dy = player1.y - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                    let newX = p.x + (dx / distance) * aiSpeed;
                    let newY = p.y + (dy / distance) * aiSpeed;
                    let newDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
                    let newFrame = p.frame;
                    if (timestamp - p.lastFrameUpdateTime >= animationFrameDuration) newFrame = (p.frame + 1) % numFrames;
                    return { ...p, x: newX, y: newY, direction: newDir, frame: newFrame, lastFrameUpdateTime: timestamp };
                });
            }

            // Collision knockback
            const dx = player2.x + spriteWidth / 2 - (player1.x + spriteWidth / 2);
            const dy = player2.y + spriteHeight / 2 - (player1.y + spriteHeight / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < spriteWidth && dist > 0) {
                const nx = dx / dist;
                const ny = dy / dist;
                const knockback = 5;
                setPlayer1(p => ({ ...p, vx: p.vx - nx * knockback, vy: p.vy - ny * knockback }));
                setPlayer2(p => ({ ...p, vx: p.vx + nx * knockback, vy: p.vy + ny * knockback }));
            }

            // Apply velocity & friction
            setPlayer1(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vx: p.vx * 0.8, vy: p.vy * 0.8 }));
            setPlayer2(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vx: p.vx * 0.8, vy: p.vy * 0.8 }));

            lastUpdateRef.current = timestamp;
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        };
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [mode, winner, player1.x, player1.y, showCountdown]);

    // Handle out of bounds
    useEffect(() => {
        if (!mode || winner) return;

        if (isOutOfBounds(player1)) {
            if (player1.lives > 1) {
                setPlayer1({ ...player1, x: arenaWidth / 2 - 100, y: arenaHeight / 2, vx: 0, vy: 0, lives: player1.lives - 1, direction: "down", frame: 0, lastFrameUpdateTime: 0 });
                setFlashP1(true);
                setTimeout(() => setFlashP1(false), 200);
            } else {
                setPlayer1(p => ({ ...p, lives: 0 }));
                setWinner("Player 2 Wins!");
            }
        }
        if (isOutOfBounds(player2)) {
            if (player2.lives > 1) {
                setPlayer2({ ...player2, x: arenaWidth / 2 + 50, y: arenaHeight / 2, vx: 0, vy: 0, lives: player2.lives - 1, direction: "down", frame: 0, lastFrameUpdateTime: 0 });
                setFlashP2(true);
                setTimeout(() => setFlashP2(false), 200);
            } else {
                setPlayer2(p => ({ ...p, lives: 0 }));
                setWinner("Player 1 Wins!");
            }
        }
    }, [player1, player2, winner]);


    const restartGame = () => startGame(mode);

    const renderPlayer = (player, flash, src) => (
        <div style={{
            position: "absolute",
            top: player.y,
            left: player.x,
            width: spriteWidth,
            height: spriteHeight,
            backgroundImage: `url(${src})`,
            backgroundSize: `${spriteWidth * numFrames}px ${spriteHeight * numFrames}px`,
            backgroundPosition: `-${player.frame * spriteWidth}px -${directionMap[player.direction] * spriteHeight}px`,
            filter: flash ? "brightness(2) saturate(2) hue-rotate(-50deg)" : "none",
            transition: "filter 0.1s",
            imageRendering: "pixelated"
        }} />
    );

    // Render
    if (!mode) { // Start screen
        return (
            <div style={{
                width: arenaWidth,
                height: arenaHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                margin: "0 auto",
                position: "relative",
                backgroundImage: "url('/assets/start_bg.png')",
                backgroundSize: "cover",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                    <button onClick={() => startGame("single")} style={{ padding: "15px 30px", fontSize: 20, backgroundColor: "#FFEB3B", color: "#000", border: "2px solid orange", borderRadius: 10, fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.1)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
                        Single Player
                    </button>
                    <button onClick={() => startGame("multi")} style={{ padding: "15px 30px", fontSize: 20, backgroundColor: "#FFEB3B", color: "#000", border: "2px solid orange", borderRadius: 10, fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.1)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
                        Multiplayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{
                width: arenaWidth,
                height: arenaHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                margin: "0 auto",
                position: "relative",
                backgroundImage: "url('/assets/bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 10,
                overflow: "hidden"
            }}>
                {/* Countdown Display */}
                {showCountdown && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 50, fontWeight: "bold", color: "white", zIndex: 20, textShadow: '2px 2px 8px #000' }}>
                        {countdown}
                    </div>
                )}
                
                {/* Player lives display */}
                <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', fontSize: '20px', fontWeight: 'bold', textShadow: '2px 2px 4px #000000' }}>
                    Player 1: {'❤️'.repeat(player1.lives)}
                </div>
                <div style={{ position: 'absolute', top: 10, right: 10, color: 'white', fontSize: '20px', fontWeight: 'bold', textShadow: '2px 2px 4px #000000' }}>
                    Player 2: {'❤️'.repeat(player2.lives)}
                </div>
                
                {/* Ellipse arena */}
                <div style={{ position: "absolute", top: arenaHeight / 2 - 150, left: arenaWidth / 2 - 220, width: 440, height: 300, border: "4px solid rgba(255,165,0,0.4)", borderRadius: "50%", boxSizing: "border-box" }} />
                
                {player1.lives > 0 && renderPlayer(player1, flashP1, "/assets/p1.png")}
                {player2.lives > 0 && renderPlayer(player2, flashP2, "/assets/p2.png")}

                {/* Winner Display */}
                {winner && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                    }}>
                        <h1 style={{ color: "lime", fontSize: 48, textShadow: '2px 2px 8px #000' }}>{winner}</h1>
                        <button onClick={restartGame} style={{
                            marginTop: 20,
                            padding: "15px 30px",
                            fontSize: 20,
                            cursor: "pointer",
                            backgroundColor: "#FFEB3B",
                            color: "#000",
                            border: "2px solid orange",
                            borderRadius: 10,
                            fontWeight: "bold"
                        }}>
                            Restart Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game;