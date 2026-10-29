"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { requestMeetingTokenAction } from "@/lib/actions/meeting.actions";
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2Icon,
  AlertCircleIcon,
  PhoneOffIcon,
} from "lucide-react";

import type { Meeting } from "@/lib/types/meeting";

interface MeetingRoomProps {
  meetingId: string;
  meeting?: Meeting | null;
}

const CREDENTIAL_KEY = (id: string) => `meeting-credential-${id}`;

export default function MeetingRoom({ meetingId, meeting: initialMeeting }: MeetingRoomProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const meeting = initialMeeting ?? null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const rawToken = typeof window !== "undefined" ? localStorage.getItem(CREDENTIAL_KEY(meetingId)) : null;
        if (!rawToken) {
          setError("Hakuna hati ya usajili. Tafadhali jisajili kwanza.");
          setLoading(false);
          return;
        }
        const result = await requestMeetingTokenAction({ meetingId, rawToken });
        if (result.success && result.data?.token) {
          setToken(result.data.token);
          setServerUrl(result.data.serverUrl ?? null);
        } else {
          setError(result.message || "Imeshindwa kupata tokeni ya mkutano.");
          toast.error(result.message || "Imeshindwa kupata tokeni ya mkutano.");
        }
      } catch (e) {
        setError("Hitilafu imetokea wakati wa kujiunga na mkutano.");
        toast.error("Hitilafu imetokea wakati wa kujiunga na mkutano.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [meetingId]);

  const handleLeave = () => {
    router.push("/public");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="mx-auto size-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Inaunganisha...</p>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-5" />
              Imeshindwa Kujiunga
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/public")} className="w-full">
              Rudi Nyumbani
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const url = serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold">
              {meeting?.title || "Chumba cha Mkutano"}
            </h1>
          </div>
          <Badge variant="secondary">Hai</Badge>
        </div>
        <Button variant="destructive" size="sm" onClick={handleLeave}>
          <PhoneOffIcon className="mr-2 size-4" />
          Toka
        </Button>
      </header>
      <main className="flex-1">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={url}
          onDisconnected={handleLeave}
          data-lk-theme="default"
          style={{ height: "100%" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </main>
    </div>
  );
}
