import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

function SessionTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-background border rounded-lg px-4 py-3 shadow-lg text-sm space-y-1">
      <p className="font-semibold">Session {label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function SessionBarChart({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada data sesi.
      </div>
    );
  }

  const chartData = sessions.map((s, i) => ({
    session: `#${i + 1}`,
    visuoSpatial: Math.round(s.visuo_spatial_fit * 1000) / 10,
    dexterity: Math.round(s.dexterity_score * 10) / 10,
    level: s.level_reached,
  }));

  const maxVS = Math.max(...chartData.map((d) => d.visuoSpatial));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis dataKey="session" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} width={40} />
          <Tooltip content={<SessionTooltip />} />
          <Bar
            dataKey="visuoSpatial"
            name="VisuoSpatial %"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.visuoSpatial === maxVS ? "#3b82f6" : "#93c5fd"
                }
              />
            ))}
          </Bar>
          <Bar
            dataKey="dexterity"
            fill="#22c55e"
            name="Dexterity"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
