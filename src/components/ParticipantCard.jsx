import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Ruler,
  Weight,
  Heart,
  Droplets,
  Hand,
  Calendar,
  GraduationCap,
} from "lucide-react";

export function ParticipantCard({ participant, sessions }) {
  if (!participant) return null;

  const totalSessions = sessions?.length || 0;
  const bestScore =
    totalSessions > 0
      ? Math.max(...sessions.map((s) => s.visuo_spatial_fit * 100)).toFixed(1)
      : null;
  const avgDexterity =
    totalSessions > 0
      ? (
          sessions.reduce((a, s) => a + s.dexterity_score, 0) / totalSessions
        ).toFixed(1)
      : null;

  return (
    <Card className="overflow-hidden">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {participant.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{participant.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
                <GraduationCap className="h-3.5 w-3.5" />
                Grade {participant.grade}
                <span className="opacity-40">|</span>
                <Calendar className="h-3.5 w-3.5" />
                {participant.age} years
                <span className="opacity-40">|</span>
                <span className="capitalize">{participant.gender}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            UID: {participant.uid}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Quick stat highlights */}
        {(totalSessions > 0 || bestScore) && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <HighlightCard
              label="Total Sessions"
              value={totalSessions}
              color="blue"
            />
            <HighlightCard
              label="Best VisuoSpatial"
              value={bestScore ? `${bestScore}%` : "N/A"}
              color="green"
            />
            <HighlightCard
              label="Avg Dexterity"
              value={avgDexterity || "N/A"}
              color="amber"
            />
          </div>
        )}

        {/* Biometric info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <BioItem
            icon={<Ruler className="h-4 w-4" />}
            label="Height"
            value={`${participant.height} cm`}
          />
          <BioItem
            icon={<Weight className="h-4 w-4" />}
            label="Weight"
            value={`${participant.weight} kg`}
          />
          <BioItem
            icon={<Heart className="h-4 w-4" />}
            label="Heart Rate"
            value={participant.heart_rate ? `${participant.heart_rate} bpm` : "—"}
            highlight={participant.heart_rate ? "red" : null}
          />
          <BioItem
            icon={<Droplets className="h-4 w-4" />}
            label="SpO2"
            value={participant.spo2 != null ? `${participant.spo2}%` : "—"}
          />
          <BioItem
            icon={<Hand className="h-4 w-4" />}
            label="Grip Strength"
            value={
              participant.grip_strength != null
                ? `${participant.grip_strength} kg`
                : "—"
            }
          />
          <BioItem
            icon={<User className="h-4 w-4" />}
            label="Gender"
            value={
              <span className="capitalize">{participant.gender}</span>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function HighlightCard({ label, value, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-center ${colors[color]}`}
    >
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

function BioItem({ icon, label, value, highlight }) {
  const highlightColor = highlight === "red" ? "text-red-500" : "";

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${highlightColor}`}>{value}</span>
    </div>
  );
}
