import React, { useEffect, useRef, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

interface GameObject {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    angle: number;
}

interface Projectile extends GameObject {
    life: number;
}

interface Enemy extends GameObject {
    health: number;
}

interface AsteroidsEasterEggProps {
    launchRect: { x: number, y: number, w: number, h: number };
}

const AsteroidsEasterEgg: React.FC<AsteroidsEasterEggProps> = ({ launchRect }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [destructionScore, setDestructionScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isRebooting, setIsRebooting] = useState(false);
    const [arcadeMode, setArcadeMode] = useState(false);
    const [malwareWarning, setMalwareWarning] = useState(false);

    // Game State Refs to maintain persistent state outside the React render cycle
    const ship = useRef<GameObject>({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: 0,
        vy: 0,
        radius: 12,
        angle: 0
    });
    const projectiles = useRef<Projectile[]>([]);
    const enemies = useRef<Enemy[]>([]);
    const keys = useRef<{ [key: string]: boolean }>({});
    const mouse = useRef<Point>({ x: 0, y: 0 });
    const scoreRef = useRef(0);
    const gameOverRef = useRef(false);
    const lastShotRef = useRef(0);
    const arcadeModeRef = useRef(false);
    const malwareWarningRef = useRef(false);
    const hasMovedRef = useRef(false);
    const isLaunchingRef = useRef(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. SHIP POSITIONING (Hangar Bay Entrance)
        ship.current.x = launchRect.x + launchRect.w / 2;
        ship.current.y = launchRect.y + launchRect.h / 2;
        ship.current.vy = 8; // Fly out speed

        setTimeout(() => {
            isLaunchingRef.current = false;
        }, 800);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();

        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.code] = true;
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                hasMovedRef.current = true;
            }
            // Prevent scrolling while playing
            if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false;
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };
        const handleMouseDown = (e: MouseEvent) => {
            if (gameOverRef.current) return;

            const angle = Math.atan2(mouse.current.y - ship.current.y, mouse.current.x - ship.current.x);
            projectiles.current.push({
                x: ship.current.x + Math.cos(angle) * 20,
                y: ship.current.y + Math.sin(angle) * 20,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                radius: 2,
                angle: angle,
                life: 100
            });
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);

        let animationFrame: number;

        const gameLoop = () => {
            if (gameOverRef.current) return;

            const scrollSpeed = 10;
            const cushion = window.innerHeight * 0.25;

            // 1. UPDATE PHYSICS
            if (!isLaunchingRef.current) {
                ship.current.angle = Math.atan2(mouse.current.y - ship.current.y, mouse.current.x - ship.current.x);

                const force = 0.5;
                if (keys.current['KeyW']) ship.current.vy -= force;
                if (keys.current['KeyS']) ship.current.vy += force;
                if (keys.current['KeyA']) ship.current.vx -= force;
                if (keys.current['KeyD']) ship.current.vx += force;

                ship.current.vx *= 0.95;
                ship.current.vy *= 0.95;
            } else {
                // Hangar dampening - ship slows down as it clears the button
                ship.current.vy *= 0.98;
            }

            ship.current.x += ship.current.vx;
            ship.current.y += ship.current.vy;

            // Wrap horizontal
            if (ship.current.x < 0) ship.current.x = canvas.width;
            if (ship.current.x > canvas.width) ship.current.x = 0;

            // AUTO-SCROLL PAGE WITH SHIP (Only if not launching)
            if (!isLaunchingRef.current) {
                if (ship.current.y < cushion && window.scrollY > 0) {
                    window.scrollBy(0, -scrollSpeed);
                    // We only push the ship back if the scroll action is likely to have happened
                    ship.current.y += scrollSpeed * 0.8;
                } else if (ship.current.y > canvas.height - cushion) {
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    if (window.scrollY < maxScroll - 5) { // Small threshold
                        window.scrollBy(0, scrollSpeed);
                        ship.current.y -= scrollSpeed * 0.8;
                    }
                }
            }

            // Constrain vertical
            if (ship.current.y < 20) ship.current.y = 20;
            if (ship.current.y > canvas.height - 20) ship.current.y = canvas.height - 20;

            // SHOOTING (Rate limited)
            if (keys.current['Space'] && Date.now() - lastShotRef.current > 150) {
                const angle = ship.current.angle;
                projectiles.current.push({
                    x: ship.current.x + Math.cos(angle) * 20,
                    y: ship.current.y + Math.sin(angle) * 20,
                    vx: Math.cos(angle) * 12,
                    vy: Math.sin(angle) * 12,
                    radius: 2,
                    angle: angle,
                    life: 100
                });
                lastShotRef.current = Date.now();
            }

            // 2. PROJECTILES & PRECISION CHARACTER DESTRUCTION
            projectiles.current.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.life--;

                // Check DOM at projectile center
                const element = document.elementFromPoint(p.x, p.y);

                if (element &&
                    element.id !== 'easter-egg-canvas' &&
                    element.tagName !== 'CANVAS' &&
                    element.tagName !== 'BODY' &&
                    element.tagName !== 'HTML') {

                    let textFound = false;
                    // Precise character destruction using caretRangeFromPoint
                    let range: any = null;
                    if ((document as any).caretRangeFromPoint) {
                        range = (document as any).caretRangeFromPoint(p.x, p.y);
                    } else if ((document as any).caretPositionFromPoint) {
                        const pos = (document as any).caretPositionFromPoint(p.x, p.y);
                        if (pos) {
                            range = { startContainer: pos.offsetNode, startOffset: pos.offset };
                        }
                    }

                    if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
                        const node = range.startContainer;
                        const offset = range.startOffset;
                        const text = node.textContent || "";
                        // Remove the character at the precise caret offset
                        if (text.length > 0) {
                            const actualOffset = Math.min(offset, text.length - 1);
                            node.textContent = text.substring(0, actualOffset) + text.substring(actualOffset + 1);
                            textFound = true;
                        }
                    }

                    if (textFound) {
                        p.life = 0;
                        scoreRef.current = Math.min(50, scoreRef.current + 1);
                        // Update react state less frequently or use a ref + interval
                        if (scoreRef.current % 5 === 0) setDestructionScore(scoreRef.current);
                    }
                }
            });
            projectiles.current = projectiles.current.filter(p => p.life > 0);

            // 3. ENEMY LOGIC & ARCADE TRANSITION
            const arcadeThreshold = 10;

            // Trigger Warning
            if (scoreRef.current >= arcadeThreshold && !arcadeModeRef.current && !malwareWarningRef.current) {
                malwareWarningRef.current = true;
                setMalwareWarning(true);
                setTimeout(() => {
                    malwareWarningRef.current = false;
                    arcadeModeRef.current = true;
                    setMalwareWarning(false);
                    setArcadeMode(true);
                }, 3000);
            }

            // Helper to spawn enemy at random edge
            const spawnEnemyAtEdge = () => {
                const side = Math.floor(Math.random() * 4);
                let ex = 0, ey = 0;
                if (side === 0) { ex = Math.random() * canvas.width; ey = -50; }
                if (side === 1) { ex = Math.random() * canvas.width; ey = canvas.height + 50; }
                if (side === 2) { ex = -50; ey = Math.random() * canvas.height; }
                if (side === 3) { ex = canvas.width + 50; ey = Math.random() * canvas.height; }
                enemies.current.push({ x: ex, y: ey, vx: 0, vy: 0, radius: 18, angle: 0, health: 1 });
            };

            // Spawn Enemies only in Arcade Mode (Stop at 50)
            if (arcadeModeRef.current && scoreRef.current < 50 && Math.random() < 0.02 && enemies.current.length < 5) {
                spawnEnemyAtEdge();
            }

            // Victory: Clear enemies if score reaches 50
            if (scoreRef.current >= 50 && enemies.current.length > 0) {
                enemies.current = [];
            }

            enemies.current.forEach(e => {
                const angle = Math.atan2(ship.current.y - e.y, ship.current.x - e.x);
                // REDUCED SPEED: Set to 1.2 instead of 2
                e.vx = Math.cos(angle) * 1.2;
                e.vy = Math.sin(angle) * 1.2;
                e.x += e.vx;
                e.y += e.vy;

                // SCROLL COMPENSATION: If the page scrolls, we move enemies inversely 
                // to make them feel "attached" to the background content rather than the UI.
                if (!isLaunchingRef.current) {
                    if (ship.current.y < cushion && window.scrollY > 0) {
                        // Page is scrolling UP, so content is moving DOWN relative to viewport
                        e.y += scrollSpeed * 0.8;
                    } else if (ship.current.y > canvas.height - cushion) {
                        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                        if (window.scrollY < maxScroll - 5) {
                            // Page is scrolling DOWN, so content is moving UP
                            e.y -= scrollSpeed * 0.8;
                        }
                    }
                }

                const dist = Math.hypot(ship.current.x - e.x, ship.current.y - e.y);
                if (dist < ship.current.radius + e.radius) {
                    gameOverRef.current = true;
                    setGameOver(true);
                }

                projectiles.current.forEach(p => {
                    const pDist = Math.hypot(p.x - e.x, p.y - e.y);
                    if (pDist < e.radius + p.radius) {
                        e.health = 0;
                        p.life = 0;
                        scoreRef.current = Math.min(50, scoreRef.current + 1);

                        // Respawn 2 for 1 (Hydra logic) from random edges if under 50
                        if (scoreRef.current < 50) {
                            for (let j = 0; j < 2; j++) {
                                spawnEnemyAtEdge();
                            }
                        }
                    }
                });
            });
            enemies.current = enemies.current.filter(e => e.health > 0);

            // 4. DRAWING
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Ship
            ctx.save();
            ctx.translate(ship.current.x, ship.current.y);

            ctx.save();
            ctx.rotate(ship.current.angle);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-12, -10);
            ctx.lineTo(-12, 10);
            ctx.closePath();
            ctx.stroke();

            // Flame
            if (keys.current['KeyW']) {
                ctx.beginPath();
                ctx.strokeStyle = '#0ff';
                ctx.moveTo(-12, 0);
                ctx.lineTo(-20 - Math.random() * 10, 0);
                ctx.stroke();
            }
            ctx.restore(); // End of ship rotation
            // Draw Ship Score (Proximity HUD)
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.fillText(scoreRef.current.toString(), 12, -12);

            // Contextual Tutorial
            if (!hasMovedRef.current) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText("WASD TO MOVE | CLICK/SPACE TO SHOOT", 0, 45);
            }
            ctx.restore();

            ctx.restore();

            // Draw Projectiles (White Beams)
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            projectiles.current.forEach(p => {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                // Draw a short trailing line for the "beam" effect
                ctx.lineTo(p.x - Math.cos(p.angle) * 10, p.y - Math.sin(p.angle) * 10);
                ctx.stroke();
            });

            // Draw Enemies
            ctx.fillStyle = '#f04';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#f04';
            enemies.current.forEach(e => {
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
                ctx.fill();
                // Spiky look
                for (let i = 0; i < 8; i++) {
                    ctx.moveTo(e.x, e.y);
                    const ang = (i / 8) * Math.PI * 2 + (Date.now() / 1000) * 2;
                    ctx.lineTo(e.x + Math.cos(ang) * (e.radius + 10), e.y + Math.sin(ang) * (e.radius + 10));
                }
                ctx.stroke();
            });

            ctx.shadowBlur = 0;
            animationFrame = requestAnimationFrame(gameLoop);
        };

        animationFrame = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            cancelAnimationFrame(animationFrame);
        };
    }, []); // Empty dependency array ensures game logic initializes once

    if (gameOver) {
        if (isRebooting) {
            return (
                <div className="fixed inset-0 z-[10001] flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-700">
                    {/* Background transition: Red to Blue */}
                    <div className="absolute inset-0 bg-red-600 animate-[reboot-bg_3s_ease-in-out_forwards]" />

                    {/* Loading Progress Bar */}
                    <div className="relative w-64 h-1 bg-white/20 rounded-full overflow-hidden mb-8">
                        <div className="absolute inset-0 bg-white animate-[reboot-progress_2.5s_ease-in-out_forwards]" />
                    </div>

                    <div className="relative z-10 font-mono text-white text-sm tracking-[0.5em] uppercase animate-pulse">
                        Restoring Kernel...
                    </div>

                    <style>{`
                        @keyframes reboot-bg {
                            0% { background-color: #dc2626; }
                            40% { background-color: #dc2626; }
                            100% { background-color: #2563eb; }
                        }
                        @keyframes reboot-progress {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(0%); }
                        }
                    `}</style>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 z-[10000] bg-red-950/90 flex flex-col items-center justify-center backdrop-blur-3xl overflow-hidden">
                {/* Pulsing Red Alert Background Overlay */}
                <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />

                {/* Glitch Grain Effect */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <div className="relative text-center z-10 px-6">
                    <div className="inline-block px-4 py-1 bg-red-600 text-white font-mono text-xs mb-8 tracking-[0.5em] animate-bounce">
                        CRITICAL ERROR
                    </div>

                    <h2 className="text-7xl md:text-9xl font-black text-white mb-4 tracking-tighter italic uppercase overflow-visible leading-none">
                        BREACH <span className="text-red-500">DETECTED</span>
                    </h2>

                    <p className="text-lg md:text-2xl text-red-400 mb-12 font-mono tracking-widest uppercase max-w-2xl mx-auto leading-relaxed">
                        Security protocols compromised. Integrity of <code className="bg-red-900 px-2">arcade_core.v1</code> has been violated.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <button
                            onClick={() => {
                                console.log("Rebooting Easter Egg Game"); // Added debug log
                                setIsRebooting(true);
                                setTimeout(() => window.location.reload(), 3000);
                            }}
                            className="group relative px-12 py-6 bg-white text-black font-black uppercase overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)]"
                        >
                            <span className="relative z-10 tracking-[0.4em]">Initialize Reboot</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 translate-x-[-101%] group-hover:translate-x-[0%] transition-transform duration-500 ease-out" />
                        </button>

                        <div className="font-mono text-red-500/50 text-xs tracking-tighter animate-pulse">
                            STATUS: OFFLINE // BYPASSING KERNEL...
                        </div>
                    </div>
                </div>

                {/* Vertical Scanning Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </div>
        );
    }

    return (
        <div id="easter-egg-container">
            {/* Global Style to hide website content in Arcade Mode */}
            {arcadeMode && !gameOver && (
                <style>{`
                    header, main, footer, section, .layout-container {
                        opacity: 0 !important;
                        pointer-events: none !important;
                        transition: opacity 2s ease-in-out !important;
                    }
                    body {
                        background: #000 !important;
                        transition: background 2s ease-in-out !important;
                        overflow: hidden !important;
                    }
                    /* Ensure only the easter egg container stays visible */
                    #easter-egg-container, #easter-egg-container * {
                        opacity: 1 !important;
                        pointer-events: auto !important;
                        visibility: visible !important;
                    }
                `}</style>
            )}

            {/* Flashy Malware Warning HUD */}
            {malwareWarning && (
                <div className="fixed inset-0 z-[10002] flex flex-col items-center justify-center pointer-events-none bg-red-600/10 animate-[strobe_0.1s_infinite]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-50 animate-pulse" />
                        <div className="relative bg-red-600 text-white px-12 py-6 font-black italic text-5xl tracking-tighter shadow-[0_0_100px_rgba(255,0,0,0.5)] border-4 border-white/20">
                            MALWARE DETECTED
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="text-red-500 font-mono tracking-[0.4em] uppercase text-sm animate-pulse">
                            Initiating System Wipe...
                        </div>
                        <div className="w-64 h-1 bg-red-900 overflow-hidden">
                            <div className="w-full h-full bg-red-500 animate-[loading-bar_3s_linear_forwards]" />
                        </div>
                    </div>

                    <style>{`
                        @keyframes strobe {
                            0% { background-color: rgba(255, 0, 0, 0.15); }
                            100% { background-color: transparent; }
                        }
                        @keyframes loading-bar {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(0%); }
                        }
                    `}</style>
                </div>
            )}

            <canvas
                id="easter-egg-canvas"
                ref={canvasRef}
                className="fixed inset-0 z-[9999] pointer-events-none"
                style={{ background: 'transparent' }}
            />
        </div>
    );
};

export default AsteroidsEasterEgg;
