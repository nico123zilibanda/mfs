"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { requestMeetingTokenAction } from "@/lib/actions/meeting.actions";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useSpeakingParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  isTrackReference,
} from "@livekit/components-react";
import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Loader2Icon,
  AlertCircleIcon,
  PhoneOffIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  MonitorIcon,
  UsersIcon,
  RadioIcon,
} from "lucide-react";

import type { Meeting } from "@/lib/types/meeting";
import { Track } from "livekit-client";

interface MeetingRoomProps {
  meetingId: string;
  meeting?: Meeting | null;
}

const CREDENTIAL_KEY = (id: string) => `meeting-credential-${id}`;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

import { useRoomContext } from "@livekit/components-react";

function MeetingRoomInner({ meeting }: { meeting: Meeting | null }) {
  const router = useRouter();
  const room = useRoomContext();
  const participants = useParticipants();
  const speaking = useSpeakingParticipants();
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeSpeaker = speaking[0] ?? participants[0] ?? null;

  const activeCameraTrack = activeSpeaker
    ? tracks.find((t) => t.participant.identity === activeSpeaker.identity)
    : undefined;

  const handleToggleMic = async () => {
    if (!localParticipant) return;
    await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
  };
  const handleToggleCam = async () => {
    if (!localParticipant) return;
    await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
  };
  const handleScreenShare = async () => {
    if (!localParticipant) return;
    await localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Halmashauri ya Wilaya ya Mlele</p>
            <h1 className="text-lg font-semibold">{meeting?.title || "Chumba cha Mkutano"}</h1>
          </div>
          <Badge className="bg-red-600 text-white">
            <RadioIcon className="mr-1 size-3" /> Hai
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-slate-300">
            <UsersIcon className="size-4" /> {participants.length}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {/* Presenter stage */}
        <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
          {activeSpeaker ? (
            <div className="flex h-full w-full flex-col">
              <div className="relative flex-1">
                {activeCameraTrack && isTrackReference(activeCameraTrack) ? (
                  <VideoTrack trackRef={activeCameraTrack} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Avatar className="size-24">
                      <AvatarFallback className="bg-slate-700 text-2xl">
                        {initials(activeSpeaker.name || activeSpeaker.identity)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2">
                <div>
                  <p className="font-semibold">{activeSpeaker.name || activeSpeaker.identity}</p>
                  <p className="text-xs text-slate-400">Anazungumza Sasa</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeSpeaker.isMicrophoneEnabled ? (
                    <MicIcon className="size-4 text-green-400" />
                  ) : (
                    <MicOffIcon className="size-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <p>Inasubiri washiriki...</p>
            </div>
          )}
        </section>

        {/* Participant gallery */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {participants
            .filter((p) => p.identity !== activeSpeaker?.identity)
            .map((p) => {
              const camTrack = tracks.find((t) => t.participant.identity === p.identity);
              return (
                <div
                  key={p.identity}
                  className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
                >
                  <div className="aspect-video">
                    {camTrack && isTrackReference(camTrack) && p.isCameraEnabled ? (
                      <VideoTrack trackRef={camTrack} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-slate-700">
                            {initials(p.name || p.identity)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 text-xs">
                    <span className="truncate">{p.name || p.identity}</span>
                    <span className="flex items-center gap-1">
                      {p.isMicrophoneEnabled ? (
                        <MicIcon className="size-3 text-green-400" />
                      ) : (
                        <MicOffIcon className="size-3 text-red-400" />
                      )}
                      {p.isCameraEnabled ? (
                        <VideoIcon className="size-3 text-green-400" />
                      ) : (
                        <VideoOffIcon className="size-3 text-red-400" />
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
        </section>
      </main>

      <footer className="flex items-center justify-center gap-3 border-t border-slate-800 p-4">
        <Button variant="destructive" size="icon" onClick={() => { room?.disconnect(); router.push("/public"); }}>
          <PhoneOffIcon />
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={handleToggleMic}>
                {localParticipant?.isMicrophoneEnabled ? <MicIcon /> : <MicOffIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{localParticipant?.isMicrophoneEnabled ? "Zima Sauti" : "Washa Sauti"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={handleToggleCam}>
                {localParticipant?.isCameraEnabled ? <VideoIcon /> : <VideoOffIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{localParticipant?.isCameraEnabled ? "Zima Kamera" : "Washa Kamera"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={handleScreenShare}>
                <MonitorIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Shiriki Skrini</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </footer>
    </div>
  );
}

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
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={url}
      onDisconnected={handleLeave}
      data-lk-theme="default"
      style={{ height: "100%" }}
    >
      <MeetingRoomInner meeting={meeting} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
