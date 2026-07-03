import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import FeedbackStatusBadge from "../dashboard/feedback-status-badge";

import { formatDate } from "@/lib/utils/format-date"; 

import type { ReportListItem } from "@/lib/types/report";

type Props = {
  reports: ReportListItem[];
};

export default function ReportsTable({ reports }: Props) {
  return (
    <div className="rounded-md border">
      <Table>

        {/* HEADER */}
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Citizen</TableHead>
            <TableHead>Village</TableHead>
            <TableHead>Ward</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* BODY */}
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              
              {/* Reference */}
              <TableCell className="font-medium">
                {report.referenceNumber}
              </TableCell>

              {/* Citizen */}
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-medium">
                    {report.fullName}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {report.phone}
                  </p>
                </div>
              </TableCell>

              {/* Village */}
              <TableCell>
                {report.village}
              </TableCell>

              {/* Ward */}
              <TableCell>
                {report.ward}
              </TableCell>

              {/* Status */}
              <TableCell>
                <FeedbackStatusBadge
                  status={report.status}
                />
              </TableCell>

              {/* Date */}
              <TableCell>
                {formatDate(report.createdAt)}
              </TableCell>

              {/* Action */}
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={`/reports/${report.id}`}
                  >
                    View
                  </Link>
                </Button>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>

      </Table>
    </div>
  );
}