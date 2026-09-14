"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  AlertTriangle,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  permanentlyDeleteFeedback,
} from "@/lib/actions/feedback-permanent-delete";

import type {
  Feedback,
} from "@/lib/types/feedback";


type PermanentDeleteDangerZoneProps = {
  report: Feedback;
};


export default function PermanentDeleteDangerZone({
  report,
}: PermanentDeleteDangerZoneProps) {

  const router = useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    isPending,
    startTransition,
  ] = useTransition();



  async function handleDelete() {

    const result =
      await permanentlyDeleteFeedback({
        id: report.id,
      });


    if (!result.success) {

      toast.error(
        result.message ??
        "Failed to permanently delete report."
      );

      return;
    }


    toast.success(
      result.message ??
      "Report permanently deleted."
    );


    setOpen(false);

    router.replace(
      "/deleted"
    );

    router.refresh();
  }



  return (
    <Card className="overflow-hidden border-red-200 shadow-sm dark:border-red-900/50">

      {/* Danger Accent */}
      <div className="h-1 w-full bg-red-600" />


      <CardHeader className="space-y-3">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-red-100
              dark:bg-red-950/40
            "
          >
            <AlertTriangle
              className="
                h-5
                w-5
                text-red-700
                dark:text-red-400
              "
            />
          </div>


          <div>

            <CardTitle className="text-lg text-red-700 dark:text-red-400">
              Danger Zone
            </CardTitle>


            <CardDescription>
              Permanent deletion action
            </CardDescription>

          </div>

        </div>


        <p className="text-sm leading-6 text-muted-foreground">
          Permanently remove this report from the system.
          This action cannot be reversed after confirmation.
        </p>

      </CardHeader>



      <CardContent>

        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >

          <AlertDialogTrigger asChild>

            <Button
              variant="destructive"
              className="w-full"
              disabled={isPending}
            >

              <Trash2 className="mr-2 h-4 w-4" />

              Delete Forever

            </Button>

          </AlertDialogTrigger>



          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>
                Permanently delete this report?
              </AlertDialogTitle>


              <AlertDialogDescription>
                This action will permanently remove this
                report from the database. Once deleted,
                this record cannot be restored.
              </AlertDialogDescription>

            </AlertDialogHeader>



            <AlertDialogFooter>

              <AlertDialogCancel
                disabled={isPending}
              >
                Cancel
              </AlertDialogCancel>



              <AlertDialogAction
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
                onClick={(event) => {

                  event.preventDefault();

                  startTransition(
                    handleDelete
                  );

                }}
              >

                {isPending
                  ? "Deleting..."
                  : "Delete Forever"
                }

              </AlertDialogAction>

            </AlertDialogFooter>


          </AlertDialogContent>

        </AlertDialog>

      </CardContent>

    </Card>
  );
}