import { useParams } from "react-router-dom";
import { useMatchWebSocket } from "@/hooks/useMatchWebSocket";
import { useState, useEffect } from "react";

export function MatchDashboard() {
  const { room_id } = useParams();
  const { players, connectionStatus, lastEvent, matchStatus } = useMatchWebSocket(room_id);
  const [pulseP1, setPulseP1] = useState(false);
  const [pulseP2, setPulseP2] = useState(false);

  // Score pulse animation
  useEffect(() => {
    setPulseP1(true);
    const t = setTimeout(() => setPulseP1(false), 300);
    return () => clearTimeout(t);
  }, [players.P1.game_score]);

  useEffect(() => {
    setPulseP2(true);
    const t = setTimeout(() => setPulseP2(false), 300);
    return () => clearTimeout(t);
  }, [players.P2.game_score]);

  const winner =
    players.P1.game_score > players.P2.game_score
      ? "P1"
      : players.P2.game_score > players.P1.game_score
        ? "P2"
        : "DRAW";

  const connDot =
    connectionStatus === "connected"
      ? "bg-[#22c55e]"
      : connectionStatus === "connecting"
        ? "bg-yellow-400 animate-pulse"
        : "bg-[#ef4444]";

  const connLabel =
    connectionStatus === "connected"
      ? "Connected"
      : connectionStatus === "connecting"
        ? "Connecting..."
        : "Disconnected";

  return (
    <div
      className="min-h-screen bg-[#0D0A08] text-white flex flex-col relative"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* HEADER */}
      <div className="h-[52px] bg-[#0D0A08] border-b border-white/7 flex items-center justify-between px-5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E60023] rounded-lg flex items-center justify-center text-base">
            🏆
          </div>
          <div
            className="font-bold text-lg tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            OAMP{" "}
            <span className="text-[#9E9893] font-normal text-sm ml-1">
              Spectator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[rgba(230,0,35,0.12)] border border-[#E60023] px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest text-[#E60023]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="w-1.5 h-1.5 bg-[#E60023] rounded-full animate-pulse" />
          LIVE
        </div>

        <div
          className="text-[13px] text-[#9E9893] tracking-wider"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Room: {room_id}
        </div>
      </div>

      {/* ARENA */}
      <div className="flex-1 flex min-h-0">
        {/* PLAYER 1 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 border-r border-white/7">
          <div
            className="text-[14px] tracking-widest text-[#9E9893] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            P1
          </div>

          <div
            className={`text-[120px] leading-none tracking-wider text-white transition-transform duration-300 ${pulseP1 ? "scale-110" : "scale-100"}`}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              textShadow: "0 0 40px rgba(230,0,35,0.4), 0 4px 12px rgba(0,0,0,0.8)",
            }}
          >
            {players.P1.game_score}
          </div>

          <div className="flex flex-col items-center gap-2 text-[13px] tracking-wider">
            <span className="text-[#9E9893]">
              Blocks Hit:{" "}
              <span className="text-white font-semibold">
                {players.P1.blocks_hit}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${players.P1.status === "playing" ? "bg-[#22c55e] animate-pulse" : players.P1.status === "waiting" ? "bg-yellow-400" : "bg-[#E60023]"}`}
              />
              <span
                className={
                  players.P1.status === "playing"
                    ? "text-[#22c55e]"
                    : players.P1.status === "waiting"
                      ? "text-yellow-400"
                      : "text-[#E60023]"
                }
              >
                {players.P1.status}
              </span>
            </span>
          </div>
        </div>

        {/* PLAYER 2 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div
            className="text-[14px] tracking-widest text-[#9E9893] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            P2
          </div>

          <div
            className={`text-[120px] leading-none tracking-wider text-white transition-transform duration-300 ${pulseP2 ? "scale-110" : "scale-100"}`}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              textShadow: "0 0 40px rgba(230,0,35,0.4), 0 4px 12px rgba(0,0,0,0.8)",
            }}
          >
            {players.P2.game_score}
          </div>

          <div className="flex flex-col items-center gap-2 text-[13px] tracking-wider">
            <span className="text-[#9E9893]">
              Blocks Hit:{" "}
              <span className="text-white font-semibold">
                {players.P2.blocks_hit}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${players.P2.status === "playing" ? "bg-[#22c55e] animate-pulse" : players.P2.status === "waiting" ? "bg-yellow-400" : "bg-[#E60023]"}`}
              />
              <span
                className={
                  players.P2.status === "playing"
                    ? "text-[#22c55e]"
                    : players.P2.status === "waiting"
                      ? "text-yellow-400"
                      : "text-[#E60023]"
                }
              >
                {players.P2.status}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER — CONNECTION STATUS */}
      <div className="h-[40px] bg-[rgba(20,16,12,0.95)] border-t border-white/5 flex items-center px-5 gap-2 flex-shrink-0">
        <span className="text-[11px] text-[#9E9893] tracking-wider uppercase mr-1">
          Connection:
        </span>
        <span className={`w-2 h-2 rounded-full ${connDot}`} />
        <span
          className="text-[11px] font-medium tracking-wider"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {connLabel}
        </span>
        {lastEvent && (
          <span className="ml-auto text-[10px] text-[#9E9893] tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            last event: {lastEvent.type}
          </span>
        )}
      </div>

      {/* GAME OVER OVERLAY */}
      {matchStatus === "finished" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.4s_ease-out]">
          <div className="text-[64px] animate-[crownBounce_1s_ease-in-out_infinite]">👑</div>
          <div
            className="text-[80px] leading-none tracking-[6px] animate-[winnerAppear_0.6s_cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: winner === "DRAW" ? "#FFD700" : "#E60023",
              textShadow: winner === "DRAW"
                ? "0 0 40px rgba(255,214,0,0.6), 0 0 80px rgba(255,214,0,0.3)"
                : "0 0 40px #E60023, 0 0 80px rgba(230,0,35,0.5)",
            }}
          >
            {winner === "DRAW" ? "DRAW" : `${winner} WINS`}
          </div>
          <div
            className="mt-3 text-[13px] tracking-widest text-white/60 uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Match Finished
          </div>
          <div className="mt-6 flex items-center gap-8 text-[28px] tracking-wider" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <span className={winner === "P1" ? "text-[#E60023]" : "text-white/50"}>
              {players.P1.game_score}
            </span>
            <span className="text-white/30">-</span>
            <span className={winner === "P2" ? "text-[#E60023]" : "text-white/50"}>
              {players.P2.game_score}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes winnerAppear {
          from { opacity: 0; transform: scale(0.5) rotate(-5deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes crownBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
