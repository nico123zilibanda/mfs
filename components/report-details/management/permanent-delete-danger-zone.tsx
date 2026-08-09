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
  Trash2,
} from "lucide-react";


import {
  permanentlyDeleteFeedback,
} from "@/lib/actions/feedback-permanent-delete";


import type {
  Feedback,
} from "@/lib/types/feedback";


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
      "/reports/deleted"
    );


    router.refresh();
  }



  return (
    <Card
      className="border-green-200/30"
    >

      <CardHeader>

        <CardTitle
          className="text-green-700"
        >
          Danger Zone
        </CardTitle>


        <CardDescription>
          Permanently delete this report.
          This action cannot be undone.
        </CardDescription>

      </CardHeader>



      <CardContent>

        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >

          <AlertDialogTrigger asChild>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isPending}
            >

              <Trash2
                className="mr-2 h-4 w-4"
              />


              Delete Forever

            </Button>

          </AlertDialogTrigger>



          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>
                Permanently delete this report?
              </AlertDialogTitle>


              <AlertDialogDescription>
                This action will permanently
                remove this report from the
                database. You will not be able
                to restore it afterwards.
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
