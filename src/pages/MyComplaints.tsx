import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ComplaintCard } from "@/components/ComplaintCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileX, ArrowLeft } from "lucide-react";

interface Complaint {
  id: string;
  issue_type: string;
  image_url: string | null;
  location: string;
  description: string;
  status: string;
  resolution_remarks: string | null;
  created_at: string;
}

export default function MyComplaints() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "citizen")) {
      navigate("/auth/citizen");
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel("my-complaints")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "complaints",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchComplaints();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoadingComplaints(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Link to="/citizen-dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Complaints</h1>
            <p className="text-muted-foreground">
              Track the status of your reported issues
            </p>
          </div>
          <Link to="/report-issue">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report New Issue
            </Button>
          </Link>
        </div>

        {loadingComplaints ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <FileX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No complaints yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't reported any issues. Help improve your city!
            </p>
            <Link to="/report-issue">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Report Your First Issue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
