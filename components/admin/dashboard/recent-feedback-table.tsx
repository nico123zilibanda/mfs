import Link from "next/link";

import FeedbackStatusBadge from "./feedback-status-badge";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { RecentFeedback } from "@/lib/types/dashboard";

type RecentFeedbackTableProps = {
  feedback: RecentFeedback[];
};

export default function RecentFeedbackTable({
  feedback,
}: RecentFeedbackTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>

        <CardDescription>
          Latest citizen feedback submissions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Citizen</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {feedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.referenceNumber}
                  </TableCell>

                  <TableCell>{item.fullName}</TableCell>

                  <TableCell>{item.ward}</TableCell>

                  <TableCell>
                    <FeedbackStatusBadge
                      status={item.status}
                    />
                  </TableCell>

                  <TableCell>
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "medium",
                    }).format(new Date(item.createdAt))}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link
                        href={`/reports/${item.id}`}
                      >
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}