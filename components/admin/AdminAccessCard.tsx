"use client";

import LoginForm from "./LoginForm";

import { ShieldCheck, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminAccessCard() {
  return (
    <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-background to-background shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>

        <Badge variant="secondary">
          Msimamizi
        </Badge>

        <CardTitle className="mt-3 text-2xl">
          Dashibodi ya Wasimamizi
        </CardTitle>

        <CardDescription className="max-w-md">
          Sehemu hii imehifadhiwa kwa matumizi ya
          wasimamizi wa mfumo pekee. Ingia kwa kutumia
          akaunti yako ili kusimamia taarifa za wananchi.
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col items-center gap-6 py-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <LockKeyhole className="h-4 w-4" />
              Ingia kwenye Dashibodi
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>

              <DialogTitle className="text-center text-2xl">
               Ingia kwa Msimamizi
              </DialogTitle>

              <DialogDescription className="text-center">
                Ingia kwa kutumia akaunti yako ya
                msimamizi ili kufikia Dashibodi.
              </DialogDescription>
            </DialogHeader>

            <LoginForm />
          </DialogContent>
        </Dialog>

        <p className="text-center text-xs text-muted-foreground">
          Mfumo huu unatumia uthibitishaji salama.
          Ni wasimamizi walioidhinishwa pekee
          wanaoruhusiwa kuingia.
        </p>
      </CardContent>
    </Card>
  );
}