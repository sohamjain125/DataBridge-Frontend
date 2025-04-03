import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Database, ArrowLeft, Play, Clock, FileCheck } from "lucide-react";
import { toast } from "sonner";
import MigrationStatus from "../components/MigrationStatus";
import { MigrationJobStatus, MigrationTableMapping } from "../utils/migration-types";
import brain from "brain";

interface ConnectionProfile {
  id: string;
  name: string;
  server: string;
  database: string;
  type: string;
}

interface Application {
  id: string;
  name: string;
  description: string;
}

const MigrationExecutionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parse params
  const sourceId = searchParams.get("sourceId");
  const destId = searchParams.get("destId");
  const appIds = searchParams.get("appIds")?.split(",") || [];
  
  // State
  const [activeTab, setActiveTab] = useState<string>("jobs");
  const [isStartingMigration, setIsStartingMigration] = useState<boolean>(false);
  const [connections, setConnections] = useState<ConnectionProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [migrationJobs, setMigrationJobs] = useState<MigrationJobStatus[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  // Fetch connection profiles
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await brain.list_connection_profiles();
        const data = await response.json();
        if (data.success) {
          setConnections(data.profiles);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };
    
    fetchConnections();
  }, []);
  
  // Fetch selected applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!sourceId) return;
      
      try {
        const response = await brain.get_selected_applications();
        const data = await response.json();
        if (data.success) {
          setApplications(data.applications);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };
    
    fetchApplications();
  }, [sourceId]);
  
  // Fetch migration jobs
  const fetchMigrationJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await brain.list_migration_jobs();
      const data = await response.json();
      if (data.success) {
        setMigrationJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching migration jobs:", error);
      toast.error("Failed to load migration jobs");
    } finally {
      setLoadingJobs(false);
    }
  };
  
  // Fetch jobs on initial load
  useEffect(() => {
    fetchMigrationJobs();
  }, []);
  
  // Get connection name by ID
  const getConnectionName = (id: string) => {
    const connection = connections.find(conn => conn.id === id);
    return connection ? connection.name : id;
  };
  
  // Get application name by ID
  const getApplicationName = (id: string) => {
    const app = applications.find(app => app.id === id);
    return app ? app.name : id;
  };
  
  // Handle start migration
  const handleStartMigration = async () => {
    if (!sourceId || !destId || appIds.length === 0) {
      toast.error("Missing required parameters for migration");
      return;
    }
    
    setIsStartingMigration(true);
    
    try {
      // Create default table mappings (in a real app, this would be configured by the user)
      const tableMappings: MigrationTableMapping[] = [
        {
          source_table: "Users",
          source_columns: ["id", "username", "email", "created_at"],
          destination_table: "Users",
          destination_columns: ["id", "username", "email", "created_at"]
        },
        {
          source_table: "Products",
          source_columns: ["id", "name", "description", "price"],
          destination_table: "Products",
          destination_columns: ["id", "name", "description", "price"]
        },
        {
          source_table: "Orders",
          source_columns: ["id", "user_id", "total", "status", "created_at"],
          destination_table: "Orders",
          destination_columns: ["id", "user_id", "total", "status", "created_at"]
        }
      ];
      
      // Start migration job
      const response = await brain.start_migration_job({
        source_connection_id: sourceId,
        destination_connection_id: destId,
        application_ids: appIds,
        table_mappings: tableMappings,
        batch_size: 1000,
        run_validations: true
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success("Migration job started successfully");
        setActiveJobId(data.job_id);
        setActiveTab("status");
        fetchMigrationJobs(); // Refresh jobs list
      } else {
        toast.error(`Failed to start migration: ${data.message}`);
      }
    } catch (error) {
      console.error("Error starting migration:", error);
      toast.error("Error starting migration");
    } finally {
      setIsStartingMigration(false);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Migration Execution</h1>
            <p className="text-muted-foreground">
              Execute and monitor data migration jobs between databases
            </p>
          </div>
        </div>
        
        <div>
          <Button 
            onClick={handleStartMigration} 
            disabled={isStartingMigration || !sourceId || !destId || appIds.length === 0}
          >
            {isStartingMigration ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Migration...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Migration
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Migration Parameters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Parameters</CardTitle>
          <CardDescription>
            Configuration for the data migration job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Database className="h-4 w-4 mr-2 text-blue-500" />
                Source Database
              </h3>
              {sourceId ? (
                <div className="text-sm">
                  <p className="text-muted-foreground">Connection ID:</p>
                  <p className="font-mono">{sourceId}</p>
                  <p className="text-muted-foreground mt-2">Connection Name:</p>
                  <p>{getConnectionName(sourceId)}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No source connection selected
                </p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <Database className="h-4 w-4 mr-2 text-green-500" />
                Destination Database
              </h3>
              {destId ? (
                <div className="text-sm">
                  <p className="text-muted-foreground">Connection ID:</p>
                  <p className="font-mono">{destId}</p>
                  <p className="text-muted-foreground mt-2">Connection Name:</p>
                  <p>{getConnectionName(destId)}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No destination connection selected
                </p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2 flex items-center">
                <FileCheck className="h-4 w-4 mr-2 text-purple-500" />
                Applications
              </h3>
              {appIds.length > 0 ? (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    {appIds.length} application(s) selected
                  </p>
                  <div className="max-h-24 overflow-y-auto mt-2">
                    <ul className="list-disc list-inside">
                      {appIds.map(id => (
                        <li key={id}>{getApplicationName(id)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No applications selected
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Migration Jobs</TabsTrigger>
          <TabsTrigger value="status" disabled={!activeJobId}>
            Current Job Status
          </TabsTrigger>
        </TabsList>
        
        {/* Jobs List Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Migration Jobs</h2>
            <Button 
              variant="outline" 
              onClick={fetchMigrationJobs}
              disabled={loadingJobs}
            >
              {loadingJobs ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          
          {loadingJobs ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : migrationJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Migration Jobs</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  There are no migration jobs yet. Start a new migration by configuring the parameters and clicking the "Start Migration" button.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {migrationJobs.map(job => (
                <Card key={job.job_id} className="overflow-hidden">
                  <div className={`h-2 ${job.status === "COMPLETED" ? "bg-green-500" : job.status === "FAILED" ? "bg-red-500" : job.status === "RUNNING" ? "bg-blue-500" : "bg-yellow-500"}`}></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          Job #{job.job_id}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(job.created_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setActiveJobId(job.job_id);
                            setActiveTab("status");
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Source</p>
                        <p className="text-sm truncate">{getConnectionName(job.source_connection_id)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="text-sm truncate">{getConnectionName(job.destination_connection_id)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Applications</p>
                        <p className="text-sm">{job.application_ids.length} apps</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{Math.round(job.progress_percentage)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded overflow-hidden">
                        <div 
                          className={`h-full ${job.status === "COMPLETED" ? "bg-green-500" : job.status === "FAILED" ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${job.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Current Job Status Tab */}
        <TabsContent value="status" className="space-y-4">
          {activeJobId ? (
            <MigrationStatus 
              jobId={activeJobId}
              autoRefresh={true}
              onComplete={() => {
                fetchMigrationJobs();
              }}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <h3 className="font-medium text-lg">No Active Job Selected</h3>
                <p className="text-muted-foreground mt-1">
                  Please select a job from the Migration Jobs tab to view its status.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MigrationExecutionPage;