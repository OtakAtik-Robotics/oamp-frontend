import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const EMOTION_COLORS = {
  happy: "#22c55e",
  sad: "#3b82f6",
  angry: "#ef4444",
  fear: "#a855f7",
  surprise: "#eab308",
  disgust: "#92400e",
  neutral: "#6b7280",
};

const EMOTION_ICONS = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  fear: "😨",
  surprise: "😲",
  disgust: "🤢",
  neutral: "😐",
};

// TODO: replace with real API data when backend endpoint GET /api/v1/analytics/{participant_id}/emotions is available
const MOCK_DATA = [
  { name: "happy", value: 45 },
  { name: "sad", value: 5 },
  { name: "angry", value: 3 },
  { name: "fear", value: 2 },
  { name: "surprise", value: 12 },
  { name: "disgust", value: 1 },
  { name: "neutral", value: 30 },
];

function EmotionTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className="bg-background border rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="font-medium capitalize">
        {EMOTION_ICONS[d.name]} {d.name}
      </p>
      <p className="text-muted-foreground">
        {d.value} samples
      </p>
    </div>
  );
}

function EmotionLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry, index) => (
        <span
          key={index}
          className="flex items-center gap-1.5 text-sm capitalize"
        >
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {EMOTION_ICONS[entry.value]} {entry.value}
        </span>
      ))}
    </div>
  );
}

export function EmotionPieChart({ data }) {
  const resolvedData = data?.length > 0 ? data : null;

  if (!resolvedData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <span className="text-4xl opacity-40">😐</span>
        <p className="font-medium text-muted-foreground">N/A (Game Mode)</p>
        <p className="text-sm text-muted-foreground">
          Data emosi tidak tersedia untuk sesi Pure Game.
        </p>
      </div>
    );
  }

  const chartData = resolvedData.map((item) => ({
    ...item,
    color: EMOTION_COLORS[item.name] || "#6b7280",
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  const dominant = chartData.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev
  );

  return (
    <div className="space-y-4">
      {/* Dominant emotion highlight */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-3xl">{EMOTION_ICONS[dominant.name]}</span>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Dominant Emotion
          </p>
          <p className="text-lg font-bold capitalize">{dominant.name}</p>
        </div>
        <div className="ml-4 rounded-full bg-muted px-3 py-1 text-sm font-medium">
          {total} total samples
        </div>
      </div>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={130}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<EmotionTooltip />} />
            <Legend content={<EmotionLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Emotion bars */}
      <div className="space-y-2">
        {[...chartData]
          .sort((a, b) => b.value - a.value)
          .map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="w-24 text-sm capitalize flex items-center gap-1">
                {EMOTION_ICONS[item.name]} {item.name}
              </span>
              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / total) * 100}%`,
                    backgroundColor: item.color,
                    minWidth: item.value > 0 ? "8px" : "0",
                  }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
