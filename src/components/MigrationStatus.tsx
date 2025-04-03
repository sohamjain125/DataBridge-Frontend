import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, Database, FileText, Loader2, XCircle, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { MigrationJobStatus, MigrationStatus as MigrationStatusEnum, MigrationLog, MigrationLogLevel } from "../utils/migration-types";
import brain from "brain";

interface MigrationStatusProps {
  jobId: string;
  autoRefresh?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
  className?: string;
}

const MigrationStatus: React.FC<MigrationStatusProps> = ({
  jobId,
  autoRefresh = true,
  onCancel,
  onComplete,
  className = "",
}) => {
  const [jobStatus, setJobStatus] = useState<MigrationJobStatus | null>(null);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000); // 3 seconds
  const [activeTab, setActiveTab] = useState<string>("status");
  const [isPolling, setIsPolling] = useState<boolean>(false);

  // Function to fetch job status
  const fetchJobStatus = async () => {
    try {
      const response = await brain.get_migration_status({ job_id: jobId });
      const data = await response.json();

      if (data.success) {
        setJobStatus(data.job_status);
        setError(null);

        // Check if we should stop polling
        const status = data.job_status.status;
        if (
          status === MigrationStatusEnum.COMPLETED ||
          status === MigrationStatusEnum.FAILED ||
          status === MigrationStatusEnum.CANCELLED
        ) {
          setIsPolling(false);
          
          // Notify on completion
          if (status === MigrationStatusEnum.COMPLETED && onComplete) {
            onComplete();
          }

          // Show toast for status change
          if (status === MigrationStatusEnum.COMPLETED) {
            toast.success("Migration completed successfully");
          } else if (status === MigrationStatusEnum.FAILED) {
            toast.error(`Migration failed: ${data.job_status.error_message || 'Unknown error'}`);
          } else if (status === MigrationStatusEnum.CANCELLED) {
            toast.info("Migration was cancelled");
          }
        }
      } else {
        setError(data.message || "Failed to fetch job status");
        setIsPolling(false);
      }
    } catch (error) {
      console.error("Error fetching job status:", error);
      setError("Error connecting to server");
      setIsPolling(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch job logs
  const fetchJobLogs = async () => {
    if (!jobId) return;
    
    try {
      const response = await brain.get_migration_logs({
        job_id: jobId,
        limit: 100,
        offset: 0
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
      } else {
        console.error("Failed to fetch logs:", data.message);
      }
    } catch (error) {
      console.error("Error fetching job logs:", error);
    }
  };

  // Function to cancel job
  const handleCancelJob = async () => {
    if (!jobId) return;
    
    try {
      const response = await brain.cancel_migration_job({ job_id: jobId });
      const data = await response.json();
      
      if (data.status === "success") {
        toast.success("Migration job cancelled");
        fetchJobStatus(); // Refresh status immediately
        
        if (onCancel) {
          onCancel();
        }
      } else {
        toast.error(`Failed to cancel job: ${data.message}`);
      }
    } catch (error) {
      console.error("Error cancelling job:", error);
      toast.error("Error cancelling job");
    }
  };

  // Set up polling for status updates
  useEffect(() => {
    if (!jobId) return;

    // Initial fetch
    fetchJobStatus();
    fetchJobLogs();
    
    // Set up polling if autoRefresh is enabled
    if (autoRefresh) {
      setIsPolling(true);
    }
    
    return () => {
      setIsPolling(false);
    };
  }, [jobId, autoRefresh]);

  // Polling effect
  useEffect(() => {
    if (!isPolling || !jobId) return;

    const statusInterval = setInterval(() => {
      fetchJobStatus();
    }, refreshInterval);
    
    const logsInterval = setInterval(() => {
      fetchJobLogs();
    }, refreshInterval * 2); // Fetch logs less frequently
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
    };
  }, [isPolling, jobId, refreshInterval]);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      return format(date, "MMM dd, yyyy HH:mm:ss");
    } catch (e) {
      return timestamp;
    }
  };

  // Helper function to get time ago
  const getTimeAgo = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "";
    }
  };

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case MigrationStatusEnum.COMPLETED:
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case MigrationStatusEnum.RUNNING:
        return (
          <Badge className="bg-blue-500">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      case MigrationStatusEnum.VALIDATING:
        return (
          <Badge className="bg-blue-500">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Validating
          </Badge>
        );
      case MigrationStatusEnum.PENDING:
        return (
          <Badge className="bg-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case MigrationStatusEnum.FAILED:
        return (
          <Badge className="bg-red-500">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case MigrationStatusEnum.CANCELLED:
        return (
          <Badge className="bg-gray-500">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case MigrationStatusEnum.PAUSED:
        return (
          <Badge className="bg-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500">
            {status}
          </Badge>
        );
    }
  };

  // Helper function to get log level badge
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case MigrationLogLevel.ERROR:
        return <Badge className="bg-red-500">Error</Badge>;
      case MigrationLogLevel.WARNING:
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case MigrationLogLevel.INFO:
        return <Badge variant="outline">Info</Badge>;
      case MigrationLogLevel.DEBUG:
        return <Badge variant="outline" className="text-muted-foreground">Debug</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-blue-500" />
            <p>Loading migration status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error && !jobStatus) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
            <p className="text-red-500">{error}</p>
            <Button className="mt-4" onClick={fetchJobStatus}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render main component
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Migration Job #{jobId}</CardTitle>
            <CardDescription>
              {jobStatus?.created_at && (
                <span>Created {getTimeAgo(jobStatus.created_at)}</span>
              )}
            </CardDescription>
          </div>
          <div>
            {jobStatus && getStatusBadge(jobStatus.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4">
            {jobStatus && (
              <div className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Progress: {Math.round(jobStatus.progress_percentage)}%
                    </span>
                    {jobStatus.end_time ? (
                      <span className="text-sm text-muted-foreground">
                        Completed {getTimeAgo(jobStatus.end_time)}
                      </span>
                    ) : jobStatus.start_time ? (
                      <span className="text-sm text-muted-foreground">
                        Started {getTimeAgo(jobStatus.start_time)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Waiting to start...
                      </span>
                    )}
                  </div>
                  <Progress value={jobStatus.progress_percentage} className="h-2" />
                </div>
                
                {/* Table Statuses */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Tables</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Table</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Records</TableHead>
                          <TableHead className="text-right">Progress</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobStatus.table_statuses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                              No tables found in migration job
                            </TableCell>
                          </TableRow>
                        ) : (
                          jobStatus.table_statuses.map((table) => (
                            <TableRow key={table.table_name}>
                              <TableCell className="font-medium">{table.table_name}</TableCell>
                              <TableCell>{getStatusBadge(table.status)}</TableCell>
                              <TableCell className="text-right">
                                {table.records_succeeded}/{table.records_total}
                                {table.records_failed > 0 && (
                                  <span className="text-red-500 ml-1">
                                    ({table.records_failed} failed)
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {table.records_total > 0 ? (
                                  <span>
                                    {Math.round((table.records_processed / table.records_total) * 100)}%
                                  </span>
                                ) : (
                                  <span>-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Error Message Section */}
                {jobStatus.error_message && (
                  <div className="rounded-md bg-red-500/10 border border-red-500/30 p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <h3 className="font-medium text-red-500">Migration Failed</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {jobStatus.error_message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Migration Logs</h3>
              <Button variant="outline" size="sm" onClick={fetchJobLogs}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] rounded-md border">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <FileText className="h-5 w-5 mr-2" />
                  <span>No logs available</span>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {logs.map((log, index) => (
                    <div key={index} className="pb-3 border-b last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center">
                          {getLogLevelBadge(log.level)}
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.details && (
                        <pre className="mt-1 p-2 text-xs bg-muted rounded-md overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {jobStatus && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Migration Details</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Job ID</TableCell>
                          <TableCell>{jobStatus.job_id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Status</TableCell>
                          <TableCell>{getStatusBadge(jobStatus.status)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Source Connection</TableCell>
                          <TableCell>{jobStatus.source_connection_id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Destination Connection</TableCell>
                          <TableCell>{jobStatus.destination_connection_id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Applications</TableCell>
                          <TableCell>
                            {jobStatus.application_ids.length} applications
                            <div className="mt-1 text-xs flex flex-wrap gap-1">
                              {jobStatus.application_ids.map((appId) => (
                                <Badge key={appId} variant="outline">{appId}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Created</TableCell>
                          <TableCell>{formatTimestamp(jobStatus.created_at)}</TableCell>
                        </TableRow>
                        {jobStatus.start_time && (
                          <TableRow>
                            <TableCell className="font-medium">Started</TableCell>
                            <TableCell>{formatTimestamp(jobStatus.start_time)}</TableCell>
                          </TableRow>
                        )}
                        {jobStatus.end_time && (
                          <TableRow>
                            <TableCell className="font-medium">Ended</TableCell>
                            <TableCell>{formatTimestamp(jobStatus.end_time)}</TableCell>
                          </TableRow>
                        )}
                        {jobStatus.estimated_completion_time && jobStatus.status === MigrationStatusEnum.RUNNING && (
                          <TableRow>
                            <TableCell className="font-medium">Estimated Completion</TableCell>
                            <TableCell>{formatTimestamp(jobStatus.estimated_completion_time)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          {autoRefresh && isPolling ? (
            <span className="text-xs text-muted-foreground flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Auto refreshing...
            </span>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                fetchJobStatus();
                fetchJobLogs();
                toast.success("Refreshed");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {jobStatus && jobStatus.status === MigrationStatusEnum.RUNNING && (
            <Button 
              variant="destructive" 
              onClick={handleCancelJob}
            >
              Cancel Migration
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MigrationStatus;