
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getActiveAdminChatPublicKeyAction,
  registerAdminChatPublicKeyAction,
} from "@/lib/actions/chat.actions";

import {
  loadAdminPrivateKey,
  persistAdminPrivateKey,
  verifyPrivateKeyMatchesPublicKey,
  generateRsaKeyPairPem,
} from "@/lib/chat/e2ee";

type Status =
  | "loading"
  | "not-initialized"
  | "initializing"
  | "ready"
  | "action-required"
  | "error";

export default function ChatEncryptionSetup() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyId, setKeyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const result = await getActiveAdminChatPublicKeyAction();

      // A database or authorization error must not be treated as
      // proof that no encryption key exists.
      if (!result.success) {
        setStatus("error");
        setMessage(
          result.message ??
            "Imeshindikana kupata ufunguo hai wa usimbaji. Kagua ruhusa za hifadhidata kisha ujaribu tena.",
        );
        return;
      }

      if (!result.data) {
        setPublicKey(null);
        setKeyId(null);
        setStatus("not-initialized");
        setMessage(null);
        return;
      }

      setPublicKey(result.data.public_key);
      setKeyId(result.data.key_id);

      const storedPrivateKey = loadAdminPrivateKey();

      if (!storedPrivateKey) {
        setStatus("action-required");
        setMessage(
          "Ufunguo binafsi unaolingana na ufunguo wa umma haupatikani kwenye kivinjari hiki. Usitengeneze ufunguo mwingine kabla ya kurejesha ufunguo wa awali.",
        );
        return;
      }

      const matches = await verifyPrivateKeyMatchesPublicKey(
        storedPrivateKey,
        result.data.public_key,
      );

      if (!matches) {
        setStatus("action-required");
        setMessage(
          "Ufunguo binafsi uliohifadhiwa kwenye kifaa hiki haulingani na ufunguo hai wa umma. Rejesha ufunguo sahihi kabla ya kutuma au kufungua ujumbe.",
        );
        return;
      }

      setStatus("ready");
      setMessage(
        "Ufunguo hai wa umma na ufunguo binafsi wa kifaa hiki vinaendana.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Imeshindikana kuthibitisha hali ya usimbaji.",
      );
    }
  }, []);

  const handleInitialize = useCallback(async () => {
    if (status === "initializing") return;

    setStatus("initializing");
    setMessage(null);

    try {
      // Check the database again to reduce the risk of replacing
      // an active key due to stale UI state.
      const existing = await getActiveAdminChatPublicKeyAction();

      if (!existing.success) {
        setStatus("error");
        setMessage(
          existing.message ??
            "Imeshindikana kukagua kama ufunguo wa usimbaji upo. Uanzishaji umeghairiwa.",
        );
        return;
      }

      if (existing.data) {
        setPublicKey(existing.data.public_key);
        setKeyId(existing.data.key_id);
        setStatus("action-required");
        setMessage(
          "Ufunguo hai wa usimbaji tayari upo. Hakuna ufunguo mbadala uliotengenezwa.",
        );
        return;
      }

      // Initialization is intended for first-time setup only.
      const pair = await generateRsaKeyPairPem();
      const matches = await verifyPrivateKeyMatchesPublicKey(
        pair.privateKeyPem,
        pair.publicKeyPem,
      );

      if (!matches) {
        setStatus("error");
        setMessage(
          "Uthibitishaji wa jozi mpya ya funguo umeshindikana. Hakuna ufunguo uliosajiliwa.",
        );
        return;
      }

      const newKeyId = crypto.randomUUID();

      const registration = await registerAdminChatPublicKeyAction({
        keyId: newKeyId,
        algorithm: "RSA-OAEP",
        publicKey: pair.publicKeyPem,
        isActive: true,
      });

      if (!registration.success) {
        setStatus("error");
        setMessage(
          registration.message ??
            "Ufunguo wa umma haukuweza kusajiliwa. Uanzishaji umeshindikana.",
        );
        return;
      }

      // The private key remains in the admin's browser.
      // It is never sent to the registration action.
      try {
        persistAdminPrivateKey(pair.privateKeyPem);
      } catch {
        setPublicKey(registration.data.public_key);
        setKeyId(registration.data.key_id);
        setStatus("action-required");
        setMessage(
          "Ufunguo wa umma umesajiliwa, lakini ufunguo binafsi haukuweza kuhifadhiwa kwenye kivinjari hiki. Usitengeneze ufunguo mwingine. Hifadhi kwa usalama ufunguo binafsi uliotengenezwa ikiwa bado unapatikana, kisha urejeshe ufunguo sahihi kabla ya kutumia chat.",
        );
        return;
      }

      const localKeyMatches = await verifyPrivateKeyMatchesPublicKey(
        loadAdminPrivateKey() ?? "",
        registration.data.public_key,
      );

      setPublicKey(registration.data.public_key);
      setKeyId(registration.data.key_id);

      if (!localKeyMatches) {
        setStatus("action-required");
        setMessage(
          "Ufunguo wa umma umesajiliwa, lakini ufunguo binafsi uliohifadhiwa haujathibitishwa. Simamisha matumizi ya chat iliyosimbwa na urejeshe ufunguo binafsi unaolingana.",
        );
        return;
      }

      setStatus("ready");
      setMessage(
        "Usimbaji wa chat umeanzishwa na ufunguo binafsi wa kifaa hiki umethibitishwa.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Uanzishaji umeshindikana.",
      );
    }
  }, [status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const statusConfig: Record<
    Status,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    loading: { label: "Inakagua", variant: "secondary" },
    "not-initialized": {
      label: "Haijaanzishwa",
      variant: "outline",
    },
    initializing: {
      label: "Inaanzisha",
      variant: "secondary",
    },
    ready: {
      label: "Usimbaji uko tayari",
      variant: "default",
    },
    "action-required": {
      label: "Hatua inahitajika",
      variant: "destructive",
    },
    error: {
      label: "Hitilafu",
      variant: "destructive",
    },
  };

  const isBusy = status === "loading" || status === "initializing";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border bg-muted/50 p-3">
            <ShieldCheck className="size-6 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">
              Mipangilio ya Usimbaji wa Chat
            </CardTitle>
            <CardDescription className="mt-1">
              Dhibiti ufunguo wa msimamizi unaotumika kusimba mazungumzo ya
              wananchi kutoka mwisho hadi mwisho.
            </CardDescription>
          </div>

          <Badge
            variant={statusConfig[status].variant}
            className="shrink-0"
          >
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-5 p-5">
        {status === "loading" ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-32" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <LockKeyhole className="size-4 text-muted-foreground" />
                  Ufunguo wa umma
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {publicKey
                    ? "Umesajiliwa kwenye hifadhidata"
                    : "Haujasajiliwa"}
                </p>

                <Badge
                  variant={publicKey ? "secondary" : "outline"}
                  className="mt-3"
                >
                  {publicKey ? "Unapatikana" : "Haupatikani"}
                </Badge>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <KeyRound className="size-4 text-muted-foreground" />
                  Ufunguo binafsi
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {status === "ready"
                    ? "Umehifadhiwa kwenye kifaa na umethibitishwa"
                    : status === "not-initialized"
                      ? "Bado haujawekwa"
                      : "Unahitaji kuthibitishwa au kurejeshwa"}
                </p>

                <Badge
                  variant={status === "ready" ? "secondary" : "outline"}
                  className="mt-3"
                >
                  {status === "ready"
                    ? "Umethibitishwa"
                    : "Haujathibitishwa"}
                </Badge>
              </div>
            </div>

            {keyId && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Kitambulisho cha ufunguo hai
                </p>
                <p className="mt-1 break-all font-mono text-xs">{keyId}</p>
              </div>
            )}
          </>
        )}

        {message && (
          <Alert variant={status === "ready" ? "default" : "destructive"}>
            {status === "ready" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}

            <AlertTitle>
              {status === "ready"
                ? "Usimbaji umethibitishwa"
                : status === "action-required"
                  ? "Urejeshaji au hatua nyingine inahitajika"
                  : "Hali ya usimbaji"}
            </AlertTitle>

            <AlertDescription className="mt-1 wrap-break-word">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {status === "not-initialized" && (
          <Alert>
            <TriangleAlert className="size-4" />
            <AlertTitle>Usanidi wa mara ya kwanza</AlertTitle>
            <AlertDescription>
              Anzisha tu ikiwa huu ni usanidi mpya na huhitaji ufunguo binafsi
              wa awali kufungua mazungumzo yaliyopo. Kupoteza ufunguo binafsi
              kunaweza kufanya ujumbe uliosimbwa usiweze kusomeka kabisa.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          {status === "not-initialized" && (
            <Button onClick={() => void handleInitialize()} disabled={isBusy}>
              {isBusy ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 size-4" />
              )}
              Anzisha Usimbaji wa Chat
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={isBusy}
          >
            {isBusy ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Onyesha Hali Upya
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
