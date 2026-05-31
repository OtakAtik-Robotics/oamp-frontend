import { useParams } from "react-router-dom";
import { useMatchWebSocket } from "@/hooks/useMatchWebSocket";

export function MatchDashboard() {
  const { room_id } = useParams();
  const { players, connectionStatus, lastEvent, matchStatus } = useMatchWebSocket(room_id);

  const winner =
    players.P1.game_score > players.P2.game_score
      ? "P1"
      : players.P2.game_score > players.P1.game_score
        ? "P2"
        : "DRAW";

  const connDot =
    connectionStatus === "connected"
      ? "bg-emerald-500"
      : connectionStatus === "connecting"
        ? "bg-amber-400"
        : "bg-red-500";

  const connLabel =
    connectionStatus === "connected"
      ? "Connected"
      : connectionStatus === "connecting"
        ? "Connecting..."
        : "Disconnected";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative">
      {/* HEADER */}
      <div className="h-[52px] bg-white border-b border-slate-200 flex items-center justify-between px-5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-base">
            🏆
          </div>
          <div className="font-bold text-lg tracking-tight text-slate-900">
            OAMP <span className="text-slate-400 font-normal text-sm ml-1">Spectator</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest text-blue-700">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
          LIVE
        </div>

        <div className="text-[13px] text-slate-400 tracking-wider">
          Room: {room_id}
        </div>
      </div>

      {/* ARENA */}
      <div className="flex-1 flex min-h-0">
        {/* PLAYER 1 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 border-r border-slate-200">
          <div className="text-sm tracking-widest text-slate-400 uppercase font-semibold">
            P1
          </div>

          <div className="text-[120px] leading-none tracking-wider text-slate-900 font-black">
            {players.P1.game_score}
          </div>

          <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
            <span>
              Blocks Hit:{" "}
              <span className="text-slate-900 font-semibold">
                {players.P1.blocks_hit}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${players.P1.status === "playing" ? "bg-emerald-500" : players.P1.status === "waiting" ? "bg-amber-400" : "bg-red-500"}`}
              />
              <span
                className={
                  players.P1.status === "playing"
                    ? "text-emerald-600"
                    : players.P1.status === "waiting"
                      ? "text-amber-600"
                      : "text-red-600"
                }
              >
                {players.P1.status}
              </span>
            </span>
          </div>
        </div>

        {/* PLAYER 2 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <div className="text-sm tracking-widest text-slate-400 uppercase font-semibold">
            P2
          </div>

          <div className="text-[120px] leading-none tracking-wider text-slate-900 font-black">
            {players.P2.game_score}
          </div>

          <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
            <span>
              Blocks Hit:{" "}
              <span className="text-slate-900 font-semibold">
                {players.P2.blocks_hit}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${players.P2.status === "playing" ? "bg-emerald-500" : players.P2.status === "waiting" ? "bg-amber-400" : "bg-red-500"}`}
              />
              <span
                className={
                  players.P2.status === "playing"
                    ? "text-emerald-600"
                    : players.P2.status === "waiting"
                      ? "text-amber-600"
                      : "text-red-600"
                }
              >
                {players.P2.status}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-[40px] bg-white border-t border-slate-200 flex items-center px-5 gap-2 flex-shrink-0">
        <span className="text-[11px] text-slate-400 tracking-wider uppercase mr-1">
          Connection:
        </span>
        <span className={`w-2 h-2 rounded-full ${connDot}`} />
        <span className="text-[11px] font-medium tracking-wider text-slate-600">
          {connLabel}
        </span>
        {lastEvent && (
          <span className="ml-auto text-[10px] text-slate-400 tracking-wider">
            last event: {lastEvent.type}
          </span>
        )}
      </div>

      {/* GAME OVER OVERLAY */}
      {matchStatus === "finished" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm">
          <div className="text-6xl mb-4">👑</div>
          <div className="text-7xl font-black leading-none tracking-wide text-white">
            {winner === "DRAW" ? "DRAW" : `${winner} WINS`}
          </div>
          <div className="mt-3 text-sm tracking-widest text-white/70 uppercase">
            Match Finished
          </div>
          <div className="mt-6 flex items-center gap-8 text-4xl font-black tracking-wide text-white">
            <span className={winner === "P1" ? "text-blue-400" : "text-white/50"}>
              {players.P1.game_score}
            </span>
            <span className="text-white/30">-</span>
            <span className={winner === "P2" ? "text-blue-400" : "text-white/50"}>
              {players.P2.game_score}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
