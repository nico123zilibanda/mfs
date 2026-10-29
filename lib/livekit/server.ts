import "server-only";

import { RoomServiceClient } from "livekit-server-sdk";

export function getLiveKitConfig() {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) {
    throw new Error("LiveKit configuration is missing.");
  }
  return { url, apiKey, apiSecret };
}

export function getRoomServiceClient() {
  const { apiKey, apiSecret } = getLiveKitConfig();
  // RoomServiceClient uses the host from LIVEKIT_URL
  const url = process.env.LIVEKIT_URL as string;
  // livekit-server-sdk v2 expects (host, apiKey, apiSecret)
  return new RoomServiceClient(url, apiKey, apiSecret);
}
