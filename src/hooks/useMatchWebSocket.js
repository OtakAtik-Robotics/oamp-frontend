import { useState, useEffect, useRef, useCallback } from "react";

function getWsUrl(roomId) {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
  const host = base.replace(/\/api\/v1$/, "").replace(/^http/, "ws");
  return `${host}/ws/match/${roomId}?role=spectator`;
}

const INITIAL_PLAYERS = {
  P1: { game_score: 0, blocks_hit: 0, status: "waiting" },
  P2: { game_score: 0, blocks_hit: 0, status: "waiting" },
};

const PLAYER_MAP = { P1: "P1", P2: "P2" };

export function useMatchWebSocket(roomId) {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastEvent, setLastEvent] = useState(null);
  const [matchStatus, setMatchStatus] = useState("playing");
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const timeoutRef = useRef(null);

  const scheduleReconnect = useRef(() => {});

  const connect = useCallback(() => {
    if (!roomId) return;

    const url = getWsUrl(roomId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
      retryRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setLastEvent(msg);

        if (msg.type === "GAME_OVER") {
          setMatchStatus("finished");
          if (msg.player_id && PLAYER_MAP[msg.player_id]) {
            setPlayers((prev) => ({
              ...prev,
              [msg.player_id]: {
                ...prev[msg.player_id],
                game_score: msg.game_score ?? prev[msg.player_id].game_score,
                blocks_hit: msg.blocks_hit ?? prev[msg.player_id].blocks_hit,
                status: "finished",
              },
            }));
          }
          return;
        }

        if (msg.type === "join" && msg.player_id) {
          setPlayers((prev) => ({
            ...prev,
            [msg.player_id]: {
              ...prev[msg.player_id],
              status: "playing",
            },
          }));
          return;
        }

        if (msg.type === "score_update" && msg.player_id) {
          setPlayers((prev) => ({
            ...prev,
            [msg.player_id]: {
              ...prev[msg.player_id],
              game_score: msg.game_score ?? prev[msg.player_id].game_score,
              blocks_hit: msg.blocks_hit ?? prev[msg.player_id].blocks_hit,
            },
          }));
          return;
        }

        if (msg.type === "leave" && msg.player_id) {
          setPlayers((prev) => ({
            ...prev,
            [msg.player_id]: {
              ...prev[msg.player_id],
              status: "left",
            },
          }));
          return;
        }

        if (msg.player_id && PLAYER_MAP[msg.player_id]) {
          setPlayers((prev) => ({
            ...prev,
            [msg.player_id]: {
              ...prev[msg.player_id],
              game_score: msg.game_score ?? prev[msg.player_id].game_score,
              blocks_hit: msg.blocks_hit ?? prev[msg.player_id].blocks_hit,
              status: msg.status ?? prev[msg.player_id].status,
            },
          }));
        }
      } catch {
        // ignore non-JSON
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      scheduleReconnect.current?.();
    };

    ws.onerror = () => {
      setConnectionStatus("disconnected");
    };
  }, [roomId]);

  useEffect(() => {
    scheduleReconnect.current = () => {
      const delay = Math.min(2000 * 2 ** retryRef.current, 16000);
      retryRef.current += 1;
      timeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  });

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      clearTimeout(timeoutRef.current);
    };
  }, [connect]);

  return { players, connectionStatus, lastEvent, matchStatus };
}
