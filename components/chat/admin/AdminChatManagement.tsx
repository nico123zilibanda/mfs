
"use client";

import { useState } from "react";

import ChatEncryptionSetup from "./ChatEncryptionSetup";
import ChatConversationList from "./ChatConversationList";
import ChatConversationPanel from "./ChatConversationPanel";

export default function AdminChatManagement() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Usimamizi wa Chat
        </h1>

        <p className="text-sm text-muted-foreground">
          Simamia mipangilio ya usimbaji wa ujumbe na mazungumzo ya wananchi.
        </p>
      </div>

      <ChatEncryptionSetup />

      <div className="grid gap-4 md:grid-cols-2">
        <ChatConversationList
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <ChatConversationPanel conversationId={selectedId} />
      </div>
    </div>
  );
}
