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

export function ParticipantCard({ participant }) {
  if (!participant) return null;

  return (
    <Card className="overflow-hidden shadow-lg">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-6 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-inner">
              {participant.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {participant.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-blue-200 text-sm">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Grade {participant.grade ?? "—"}
                </span>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {participant.age ?? "—"} tahun
                </span>
                <span className="opacity-30">|</span>
                <span className="capitalize">{participant.gender ?? "—"}</span>
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/15 text-white border-0 backdrop-blur-sm font-mono"
          >
            {participant.uid}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Biometric info grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <BioItem
            icon={<Ruler className="h-4 w-4" />}
            label="Tinggi"
            value={participant.height != null ? `${participant.height} cm` : "—"}
          />
          <BioItem
            icon={<Weight className="h-4 w-4" />}
            label="Berat"
            value={participant.weight != null ? `${participant.weight} kg` : "—"}
          />
          <BioItem
            icon={<Heart className="h-4 w-4" />}
            label="Detak Jantung"
            value={
              participant.heart_rate
                ? `${participant.heart_rate} bpm`
                : "—"
            }
            accent={participant.heart_rate ? "red" : null}
          />
          <BioItem
            icon={<Droplets className="h-4 w-4" />}
            label="SpO2"
            value={
              participant.spo2 != null
                ? `${participant.spo2}%`
                : "—"
            }
            accent={participant.spo2 != null ? "blue" : null}
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
            value={<span className="capitalize">{participant.gender ?? "—"}</span>}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BioItem({ icon, label, value, accent }) {
  const accentMap = {
    red: "border-red-200 bg-red-50",
    blue: "border-blue-200 bg-blue-50",
  };

  return (
    <div
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 ${
        accent ? accentMap[accent] : "bg-slate-50/50"
      }`}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
