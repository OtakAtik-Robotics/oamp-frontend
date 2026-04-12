import { useState, useRef, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, CheckCircle, Loader2 } from "lucide-react";

const GRADES = [
  "1A","1B","2A","2B","3A","3B","4A","4B","5A","5B","6A","6B",
];

const initialForm = {
  uid: "",
  name: "",
  age: "",
  grade: "",
  gender: "",
  height: "",
  weight: "",
  heart_rate: "",
  spo2: "",
  grip_strength: "",
};

export function Register() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(null);
  const uidRef = useRef(null);

  useEffect(() => {
    uidRef.current?.focus();
  }, []);

  useEffect(() => {
    if (registered) {
      const timer = setTimeout(() => {
        setRegistered(null);
        setForm(initialForm);
        setTimeout(() => uidRef.current?.focus(), 50);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registered]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleUidScan(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const uid = form.uid.trim();
      if (!uid) return;

      try {
        const res = await api.get(`/robot/auth/${uid}`);
        if (res.data) {
          toast.info(`Peserta sudah terdaftar: ${res.data.name}`);
          return;
        }
      } catch {
        // 404 means UID not registered yet — proceed with form
      }

      // Move focus to Name field
      document.getElementById("name")?.focus();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      uid: form.uid.trim(),
      name: form.name.trim(),
      age: parseInt(form.age),
      grade: form.grade,
      gender: form.gender,
      height: parseFloat(form.height),
      weight: parseFloat(form.weight),
      heart_rate: form.heart_rate ? parseInt(form.heart_rate) : undefined,
      spo2: form.spo2 ? parseFloat(form.spo2) : undefined,
      grip_strength: form.grip_strength ? parseFloat(form.grip_strength) : undefined,
    };

    try {
      const res = await api.post("/participants", payload);
      toast.success("Peserta berhasil didaftarkan!");
      setRegistered(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gagal mendaftarkan peserta.";
      if (
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("unique") ||
        msg.toLowerCase().includes("failed to register")
      ) {
        toast.error("UID sudah terdaftar.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Card className="border-green-300 bg-green-50">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <CheckCircle className="h-16 w-16 text-green-600" />
            <h2 className="text-xl font-bold text-green-800">
              Registrasi Berhasil!
            </h2>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold">{registered.name}</p>
              <p className="text-sm text-muted-foreground">
                UID: {registered.uid}
              </p>
              <Badge>{registered.grade}</Badge>
            </div>
            <div className="bg-white rounded-lg p-4 w-full mt-2 border">
              <p className="text-xs text-muted-foreground text-center">
                QR Code Placeholder
              </p>
              <div className="w-32 h-32 mx-auto mt-2 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                QR
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Registration Station
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uid">UID (RFID) *</Label>
              <Input
                id="uid"
                name="uid"
                ref={uidRef}
                value={form.uid}
                onChange={handleChange}
                onKeyDown={handleUidScan}
                placeholder="Scan RFID tag..."
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Scanner RFID otomatis terdeteksi. Arahkan scanner ke field ini.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama peserta"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min={3}
                  max={18}
                  value={form.age}
                  onChange={handleChange}
                  placeholder="3-18"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Grade *</Label>
                <Select
                  value={form.grade}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, grade: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <RadioGroup
                value={form.gender}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, gender: val }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min={50}
                  step={0.1}
                  value={form.height}
                  onChange={handleChange}
                  placeholder="Tinggi badan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min={5}
                  step={0.1}
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="Berat badan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                <Input
                  id="heart_rate"
                  name="heart_rate"
                  type="number"
                  min={40}
                  max={220}
                  value={form.heart_rate}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spo2">SpO2 (%)</Label>
                <Input
                  id="spo2"
                  name="spo2"
                  type="number"
                  min={0}
                  max={100}
                  value={form.spo2}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grip_strength">Grip (kg)</Label>
                <Input
                  id="grip_strength"
                  name="grip_strength"
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.grip_strength}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Participant"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
