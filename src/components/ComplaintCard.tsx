import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

interface ComplaintCardProps {
  complaint: {
    id: string;
    issue_type: string;
    image_url: string | null;
    location: string;
    description: string;
    status: string;
    resolution_remarks: string | null;
    created_at: string;
  };
}

const issueTypeLabels: Record<string, string> = {
  pothole: "Pothole",
  streetlight: "Streetlight",
  garbage: "Garbage",
  drainage: "Drainage",
  road_damage: "Road Damage",
  other: "Other",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "destructive" },
  in_progress: { label: "In Progress", variant: "secondary" },
  resolved: { label: "Resolved", variant: "default" },
};

export function ComplaintCard({ complaint }: ComplaintCardProps) {
  const status = statusConfig[complaint.status] || statusConfig.pending;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {complaint.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={complaint.image_url}
            alt={`Issue: ${complaint.issue_type}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {issueTypeLabels[complaint.issue_type] || complaint.issue_type}
          </CardTitle>
          <Badge 
            variant={status.variant}
            className={
              complaint.status === "pending" 
                ? "bg-yellow-500 hover:bg-yellow-600" 
                : complaint.status === "in_progress"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-green-500 hover:bg-green-600"
            }
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{complaint.location}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{complaint.description}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(complaint.created_at), "MMM dd, yyyy")}</span>
        </div>

        {complaint.resolution_remarks && complaint.status === "resolved" && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Resolution: {complaint.resolution_remarks}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
