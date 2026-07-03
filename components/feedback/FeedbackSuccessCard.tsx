"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCopy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { toast } from "sonner";

type FeedbackSuccessCardProps = {
  referenceNumber: string;
  onSubmitAnother: () => void;
};

export default function FeedbackSuccessCard({
  referenceNumber,
  onSubmitAnother,
}: FeedbackSuccessCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(referenceNumber);

      setCopied(true);
      toast.success("Reference number copied!");

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);

      toast.error("Imeshindwa kunakili namba ya malejereo");
    }
  }

  return (
    <Card className="mx-auto max-w-2xl border-green-200">
      <CardHeader className="text-center items-center">
        <div className="mb-4 rounded-full bg-green-100 p-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <CardTitle className="text-2xl">
          Maoni Yamewasilishwa kwa Mafanikio.
        </CardTitle>

        <CardDescription className="max-w-md">
        Asante kwa kuripoti ufisadi.
        Ripoti yako imepokelewa kwa mafanikio.
        Tafadhali hifadhi nambari yako ya marejeleo kwa ajili ya ufuatiliaji.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Reference Number Box */}
        <div className="rounded-lg border bg-muted/40 p-5">
          <p className="text-sm text-muted-foreground mb-2">
            Namba ya Marejeleo
          </p>

          <div className="flex items-center justify-between gap-3">
            <code className="text-lg font-bold tracking-wider">
              {referenceNumber}
            </code>

            <Button
              variant="outline"
              size="icon"
              onClick={copyReference}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <ClipboardCopy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          onClick={onSubmitAnother}
        >
          Tuma Maoni Mengine
        </Button>
      </CardContent>
    </Card>
  );
}