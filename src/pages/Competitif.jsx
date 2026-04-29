import { useState, useEffect, useRef } from "react";

const MAX_SCORE = 20;
const BAR_COUNT = 12;

export function Competitif() {
  const [state, setState] = useState({
    ready: [false, false],
    scores: [0, 0],
    phase: "pre",
    timerVal: 0,
    winner: null,
  });
  const [countdownNum, setCountdownNum] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const updateBars = (player, score) => {
    const pct = Math.min((score / MAX_SCORE) * 100, 100);
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      const colPct = ((i + 1) / BAR_COUNT) * 100;
      const height = pct >= colPct ? "100%" : pct > colPct - 100 / BAR_COUNT ? `${((pct - (colPct - 100 / BAR_COUNT)) / (100 / BAR_COUNT)) * 100}%` : "0%";
      return { index: i, height, delay: i * 0.02 };
    });
  };

  const setReady = (player) => {
    if (state.phase !== "pre") return;
    if (state.ready[player - 1]) return;
    
    const newReady = [...state.ready];
    newReady[player - 1] = true;
    setState({ ...state, ready: newReady });

    if (newReady[0] && newReady[1]) {
      setTimeout(startCountdown, 400);
    }
  };

  const startCountdown = () => {
    setState({ ...state, phase: "countdown" });
    setShowCountdown(true);
    let i = 0;
    const nums = ["3", "2", "1", "START!"];
    
    countdownRef.current = setInterval(() => {
      if (i >= nums.length) {
        clearInterval(countdownRef.current);
        setShowCountdown(false);
        startGame();
        return;
      }
      setCountdownNum(nums[i]);
      i++;
    }, 1000);
  };

  const startGame = () => {
    setState({ ...state, phase: "playing" });
    timerRef.current = setInterval(() => {
      setState((prev) => {
        const newTimerVal = prev.timerVal + 1;
        return { ...prev, timerVal: newTimerVal };
      });
    }, 1000);
  };

  const addPoint = (player, pts = 1) => {
    if (state.phase !== "playing") return;
    const newScores = [...state.scores];
    newScores[player - 1] = Math.min(newScores[player - 1] + pts, MAX_SCORE);
    setState({ ...state, scores: newScores });
  };

  const triggerWin = (player) => {
    if (state.phase === "finished") return;
    if (state.phase !== "playing") {
      setState({ ...state, phase: "playing" });
    }
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
    
    const newScores = [...state.scores];
    newScores[player - 1] = MAX_SCORE;
    
    setState({ ...state, phase: "finished", winner: player, scores: newScores });
    
    setNotification(`🏆 Player ${player} finished first!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
    
    spawnConfetti();
  };

  const spawnConfetti = () => {
    const colors = ["#E60023", "#FFFFFF", "#FFD600", "#FF6B6B", "#FFF", "#B8001B"];
    const shapes = ["■", "●", "▲", "◆", "★"];
    const pieces = [];
    
    for (let i = 0; i < 80; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        fontSize: 6 + Math.random() * 10,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 0.5,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 4000);
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
    setState({
      ready: [false, false],
      scores: [0, 0],
      phase: "pre",
      timerVal: 0,
      winner: null,
    });
    setConfettiPieces([]);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const getLeaderText = () => {
    const s1 = state.scores[0], s2 = state.scores[1];
    if (s1 === s2 && s1 === 0) return "Waiting...";
    if (s1 > s2) return "P1 Leading";
    if (s2 > s1) return "P2 Leading";
    return "Tied!";
  };

  const getStatus = (player) => {
    if (state.winner === player) return "finished";
    if (state.phase === "playing") return "playing";
    if (state.ready[player - 1]) return "ready";
    return "not-ready";
  };

  const bars1 = updateBars(1, state.scores[0]);
  const bars2 = updateBars(2, state.scores[1]);

  return (
    <div className="min-h-screen bg-[#0D0A08] text-white overflow-hidden flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* HEADER */}
      <div className="h-[52px] bg-[#0D0A08] border-b border-white/7 flex items-center justify-between px-5 flex-shrink-0 z-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E60023] rounded-lg flex items-center justify-center text-base">🏆</div>
          <div className="font-bold text-lg tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            OAMP <span className="text-[#9E9893] font-normal text-sm ml-1">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[rgba(230,0,35,0.12)] border border-[#E60023] px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest text-[#E60023]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="w-1.5 h-1.5 bg-[#E60023] rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[13px] text-[#9E9893] tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatTime(state.timerVal)}
          </div>
          <div className="text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded bg-white/7 text-[#9E9893] uppercase">
            {state.phase === "pre" ? "PRE-GAME" : state.phase === "countdown" ? "COUNTDOWN" : state.phase === "playing" ? "PLAYING" : "FINISHED"}
          </div>
        </div>
      </div>

      {/* COUNTDOWN OVERLAY */}
      {showCountdown && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-[1000]">
          <div className={countdownNum === "START!" ? "text-[100px] text-[#E60023] tracking-[12px]" : "text-[220px] tracking-wider"} style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 0 60px #E60023, 0 0 120px rgba(230,0,35,0.4)" }}>
            {countdownNum}
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      <div className={`fixed top-[70px] left-1/2 -translate-x-1/2 -translate-y-5 bg-gradient-to-r from-[#E60023] to-[#B8001B] text-white px-6 py-3 rounded-lg font-bold text-[13px] tracking-wide z-[200] transition-all duration-400 ${showNotification ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`} style={{ boxShadow: "0 8px 30px rgba(230,0,35,0.5)" }}>
        {notification}
      </div>

      {/* CONFETTI */}
      <div className="fixed inset-0 pointer-events-none z-[500] overflow-hidden">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.left}%`,
              color: piece.color,
              fontSize: `${piece.fontSize}px`,
              animation: `confettiFall ${piece.duration}s linear forwards`,
              animationDelay: `${piece.delay}s`,
            }}
          >
            {piece.shape}
          </div>
        ))}
      </div>

      {/* ARENA */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex min-h-0 gap-1 p-1">
          {/* PLAYER 1 */}
          <div className={`flex-1 relative bg-[#111] rounded-xl overflow-hidden flex flex-col transition-all duration-500 ${state.winner === 1 ? "shadow-[0_0_0_2px_#E60023,0_0_40px_rgba(230,0,35,0.5),0_0_80px_rgba(230,0,35,0.2)]" : ""} ${state.winner === 2 ? "opacity-45 grayscale-[0.5]" : ""}`}>
            <div className="flex-1 relative bg-[#1a1a1a] overflow-hidden">
              {/* Camera simulation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] bg-[length:300%_300%] animate-[camMove_8s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] h-[85%] bg-gradient-to-t from-white/6 via-white/6 to-transparent rounded-t-[40%]"></div>
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
              </div>
              {/* Camera corners */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-white/40"></div>
              <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-white/40"></div>
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-white/40"></div>
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-white/40"></div>
              {/* Live badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded px-2 py-1 text-[10px] font-bold tracking-widest text-white border border-white/10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <div className="w-1 h-1 bg-[#E60023] rounded-full animate-pulse"></div>
                CAM 1
              </div>
              {/* Score overlay */}
              <div className="absolute top-3 right-3 text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)" }}>
                <span className="block text-[42px] leading-none tracking-wider">{state.scores[0]}</span>
                <span className="block text-[10px] font-semibold tracking-wider text-white/50 text-right">PTS</span>
              </div>
              {/* Ready overlay */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/30 backdrop-blur-sm z-10 transition-opacity duration-400 ${state.phase === "pre" && !state.ready[0] ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <button
                  onClick={() => setReady(1)}
                  className={`w-40 h-40 rounded-full border-3 border-white/20 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 ${state.ready[0] ? "bg-gradient-to-br from-[#00C853] to-[#00a045] cursor-default" : "bg-gradient-to-br from-[#E60023] to-[#B8001B] animate-[readyPulse_2s_ease-in-out_infinite] hover:scale-105 hover:shadow-[0_0_40px_rgba(230,0,35,0.5)] active:scale-96"}`}
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "4px", color: "white" }}
                >
                  <span className="text-[36px] leading-none">{state.ready[0] ? "✓" : "⚡"}</span>
                  <span className="text-[22px] tracking-widest">{state.ready[0] ? "READY!" : "READY"}</span>
                </button>
                <div className="text-[12px] font-medium tracking-wider text-white/50 text-center">Tap to mark yourself ready</div>
              </div>
              {/* Winner badge */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 z-15 pointer-events-none transition-opacity ${state.winner === 1 ? "opacity-100 animate-[winnerAppear_0.6s_cubic-bezier(0.34,1.56,0.64,1)]" : "opacity-0"}`}>
                <div className="text-[56px] animate-[crownBounce_1s_ease-in-out_infinite]">👑</div>
                <div className="text-[72px] tracking-[8px] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 0 40px #E60023, 0 0 80px rgba(230,0,35,0.5)" }}>WINNER</div>
                <div className="text-[12px] tracking-widest text-white/70 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>First to finish</div>
              </div>
            </div>
            {/* Player HUD */}
            <div className="h-[68px] bg-gradient-to-b from-black/95 to-[#0D0A08] flex items-center justify-between px-4 border-t border-white/6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E60023] flex items-center justify-center text-base tracking-wider flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>P1</div>
                <div>
                  <div className="font-bold text-[15px] tracking-wide">Player 1</div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium tracking-wide">
                    <div className={`w-1 h-1 rounded-full ${getStatus(1) === "not-ready" ? "bg-[#9E9893]" : getStatus(1) === "ready" ? "bg-[#00C853] animate-pulse" : getStatus(1) === "playing" ? "bg-[#E60023] animate-pulse" : "bg-[#FFD600]"}`}></div>
                    <div className={getStatus(1) === "not-ready" ? "text-[#9E9893]" : getStatus(1) === "ready" ? "text-[#00C853]" : getStatus(1) === "playing" ? "text-[#E60023]" : "text-[#FFD600]"}>
                      {getStatus(1) === "not-ready" ? "Not Ready" : getStatus(1) === "ready" ? "Ready" : getStatus(1) === "playing" ? "Playing" : "Finished"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[32px] leading-none tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{state.scores[0]}</div>
                <div className="text-[10px] font-semibold tracking-wider text-[#9E9893] uppercase">Points</div>
              </div>
            </div>
          </div>

          {/* PLAYER 2 */}
          <div className={`flex-1 relative bg-[#111] rounded-xl overflow-hidden flex flex-col transition-all duration-500 ${state.winner === 2 ? "shadow-[0_0_0_2px_#E60023,0_0_40px_rgba(230,0,35,0.5),0_0_80px_rgba(230,0,35,0.2)]" : ""} ${state.winner === 1 ? "opacity-45 grayscale-[0.5]" : ""}`}>
            <div className="flex-1 relative bg-[#1a1a1a] overflow-hidden">
              {/* Camera simulation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2e1a1a] via-[#3e1616] to-[#600f0f] bg-[length:300%_300%] animate-[camMove_8s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] h-[85%] bg-gradient-to-t from-white/6 via-white/6 to-transparent rounded-t-[40%]"></div>
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
              </div>
              {/* Camera corners */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-white/40"></div>
              <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-white/40"></div>
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-white/40"></div>
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-white/40"></div>
              {/* Live badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded px-2 py-1 text-[10px] font-bold tracking-widest text-white border border-white/10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <div className="w-1 h-1 bg-[#E60023] rounded-full animate-pulse"></div>
                CAM 2
              </div>
              {/* Score overlay */}
              <div className="absolute top-3 right-3 text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)" }}>
                <span className="block text-[42px] leading-none tracking-wider">{state.scores[1]}</span>
                <span className="block text-[10px] font-semibold tracking-wider text-white/50 text-right">PTS</span>
              </div>
              {/* Ready overlay */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/30 backdrop-blur-sm z-10 transition-opacity duration-400 ${state.phase === "pre" && !state.ready[1] ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <button
                  onClick={() => setReady(2)}
                  className={`w-40 h-40 rounded-full border-3 border-white/20 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-200 ${state.ready[1] ? "bg-gradient-to-br from-[#00C853] to-[#00a045] cursor-default" : "bg-gradient-to-br from-[#888] to-[#555] animate-[readyPulse_2s_ease-in-out_infinite] hover:scale-105 hover:shadow-[0_0_40px_rgba(136,136,136,0.5)] active:scale-96"}`}
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "4px", color: "white" }}
                >
                  <span className="text-[36px] leading-none">{state.ready[1] ? "✓" : "⚡"}</span>
                  <span className="text-[22px] tracking-widest">{state.ready[1] ? "READY!" : "READY"}</span>
                </button>
                <div className="text-[12px] font-medium tracking-wider text-white/50 text-center">Tap to mark yourself ready</div>
              </div>
              {/* Winner badge */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 z-15 pointer-events-none transition-opacity ${state.winner === 2 ? "opacity-100 animate-[winnerAppear_0.6s_cubic-bezier(0.34,1.56,0.64,1)]" : "opacity-0"}`}>
                <div className="text-[56px] animate-[crownBounce_1s_ease-in-out_infinite]">👑</div>
                <div className="text-[72px] tracking-[8px] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: "0 0 40px #E60023, 0 0 80px rgba(230,0,35,0.5)" }}>WINNER</div>
                <div className="text-[12px] tracking-widest text-white/70 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>First to finish</div>
              </div>
            </div>
            {/* Player HUD */}
            <div className="h-[68px] bg-gradient-to-b from-black/95 to-[#0D0A08] flex items-center justify-between px-4 border-t border-white/6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#3A3530] flex items-center justify-center text-base tracking-wider flex-shrink-0" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>P2</div>
                <div>
                  <div className="font-bold text-[15px] tracking-wide">Player 2</div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium tracking-wide">
                    <div className={`w-1 h-1 rounded-full ${getStatus(2) === "not-ready" ? "bg-[#9E9893]" : getStatus(2) === "ready" ? "bg-[#00C853] animate-pulse" : getStatus(2) === "playing" ? "bg-[#E60023] animate-pulse" : "bg-[#FFD600]"}`}></div>
                    <div className={getStatus(2) === "not-ready" ? "text-[#9E9893]" : getStatus(2) === "ready" ? "text-[#00C853]" : getStatus(2) === "playing" ? "text-[#E60023]" : "text-[#FFD600]"}>
                      {getStatus(2) === "not-ready" ? "Not Ready" : getStatus(2) === "ready" ? "Ready" : getStatus(2) === "playing" ? "Playing" : "Finished"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[32px] leading-none tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{state.scores[1]}</div>
                <div className="text-[10px] font-semibold tracking-wider text-[#9E9893] uppercase">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* BAR CHART */}
        <div className="h-[130px] bg-gradient-to-b from-[#0D0A08] to-[#050403] border-t border-white/6 flex items-end px-4 gap-4 flex-shrink-0">
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between py-2.5 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#9E9893] flex-shrink-0">
              <span className="text-white">Player 1</span>
              <span className="tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{state.scores[0]} pts</span>
            </div>
            <div className="flex-1 flex items-end gap-1 min-h-0 pb-1">
              {bars1.map((bar) => (
                <div key={bar.index} className="flex-1 h-full bg-white/4 rounded-t-sm relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#E60023] to-[#B8001B] rounded-t-sm transition-all duration-500"
                    style={{ height: bar.height, transitionDelay: `${bar.delay}s`, boxShadow: state.scores[0] >= state.scores[1] ? "0 -4px 20px rgba(230,0,35,0.5)" : "none" }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-px h-[60%] bg-white/8 self-end mb-1 flex-shrink-0"></div>
          <div className="flex flex-col items-center justify-center gap-1 px-6 min-w-[140px] flex-shrink-0">
            <div className="text-[28px] tracking-wider text-[#E60023]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>VS</div>
            <div className={`text-[11px] font-semibold tracking-wider text-center transition-colors ${state.scores[0] > 0 || state.scores[1] > 0 ? "text-white" : "text-[#9E9893]"}`}>
              {getLeaderText()}
            </div>
          </div>
          <div className="w-px h-[60%] bg-white/8 self-end mb-1 flex-shrink-0"></div>
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between py-2.5 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#9E9893] flex-shrink-0">
              <span className="text-white">Player 2</span>
              <span className="tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{state.scores[1]} pts</span>
            </div>
            <div className="flex-1 flex items-end gap-1 min-h-0 pb-1">
              {bars2.map((bar) => (
                <div key={bar.index} className="flex-1 h-full bg-white/4 rounded-t-sm relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#888] to-[#555] rounded-t-sm transition-all duration-500"
                    style={{ height: bar.height, transitionDelay: `${bar.delay}s` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DEMO CONTROLS */}
      <div className="h-[44px] bg-[rgba(20,16,12,0.95)] border-t border-white/5 flex items-center justify-center gap-2.5 flex-shrink-0 px-4">
        <span className="text-[10px] text-[#9E9893] tracking-wider uppercase mr-1">Demo:</span>
        <button onClick={() => addPoint(1)} className="px-3.5 py-1.5 rounded border border-white/10 bg-white/6 text-white/70 text-[11px] font-semibold tracking-wide hover:bg-white/12 hover:text-white hover:border-white/20 transition-all">+1 Player 1</button>
        <button onClick={() => addPoint(2)} className="px-3.5 py-1.5 rounded border border-white/10 bg-white/6 text-white/70 text-[11px] font-semibold tracking-wide hover:bg-white/12 hover:text-white hover:border-white/20 transition-all">+1 Player 2</button>
        <button onClick={() => addPoint(1, 5)} className="px-3.5 py-1.5 rounded border border-white/10 bg-white/6 text-white/70 text-[11px] font-semibold tracking-wide hover:bg-white/12 hover:text-white hover:border-white/20 transition-all">+5 Player 1</button>
        <button onClick={() => addPoint(2, 5)} className="px-3.5 py-1.5 rounded border border-white/10 bg-white/6 text-white/70 text-[11px] font-semibold tracking-wide hover:bg-white/12 hover:text-white hover:border-white/20 transition-all">+5 Player 2</button>
        <button onClick={() => triggerWin(1)} className="px-3.5 py-1.5 rounded bg-[#E60023] border border-[#E60023] text-white text-[11px] font-semibold tracking-wide hover:bg-[#B8001B] transition-all">P1 Wins</button>
        <button onClick={() => triggerWin(2)} className="px-3.5 py-1.5 rounded bg-[#E60023] border border-[#E60023] text-white text-[11px] font-semibold tracking-wide hover:bg-[#B8001B] transition-all">P2 Wins</button>
        <button onClick={resetGame} className="px-3.5 py-1.5 rounded border border-white/10 bg-white/6 text-white/70 text-[11px] font-semibold tracking-wide hover:bg-white/12 hover:text-white hover:border-white/20 transition-all">↺ Reset</button>
      </div>

      <style jsx global>{`
        @keyframes camMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes readyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(230,0,35,0.5); }
          50% { box-shadow: 0 0 0 20px rgba(230,0,35,0); }
        }
        @keyframes winnerAppear {
          from { opacity: 0; transform: scale(0.5) rotate(-5deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes crownBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateY(110vh) rotate(720deg) scale(0.5); }
        }
      `}</style>
    </div>
  );
}
