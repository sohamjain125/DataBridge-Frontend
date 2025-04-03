import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Clock,
  Database,
  Filter,
  Loader2,
  MoreVertical,
  Play,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import MigrationStatus from "../components/MigrationStatus";
import {
  MigrationJobStatus,
  MigrationStatus as MigrationStatusEnum,
} from "../utils/migration-types";
import brain from "brain";

// Dashboard statistics interface
interface DashboardStats {
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  pendingJobs: number;
}

// Filter options interface
interface FilterOptions {
  status: string | null;
  applicationId: string | null;
  searchTerm: string;
  sortBy: "created_at" | "status" | "progress_percentage";
  sortDirection: "asc" | "desc";
}

const MigrationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [migrationJobs, setMigrationJobs] = useState<MigrationJobStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(
    searchParams.get("jobId")
  );
  const [refreshInterval, setRefreshInterval] = useState<number>(10000); // 10 seconds default
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [applications, setApplications] = useState<string[]>([]);

  // Filter and sort state
  const [filters, setFilters] = useState<FilterOptions>({
    status: searchParams.get("status"),
    applicationId: searchParams.get("appId"),
    searchTerm: searchParams.get("search") || "",
    sortBy: (searchParams.get("sortBy") as "created_at" | "status" | "progress_percentage") || "created_at",
    sortDirection: (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
  });

  // Derived stats
  const dashboardStats = useMemo<DashboardStats>(() => {
    return {
      totalJobs: migrationJobs.length,
      runningJobs: migrationJobs.filter(
        (job) => job.status === MigrationStatusEnum.RUNNING
      ).length,
      completedJobs: migrationJobs.filter(
        (job) => job.status === MigrationStatusEnum.COMPLETED
      ).length,
      failedJobs: migrationJobs.filter(
        (job) => job.status === MigrationStatusEnum.FAILED ||
               job.status === MigrationStatusEnum.CANCELLED
      ).length,
      pendingJobs: migrationJobs.filter(
        (job) => job.status === MigrationStatusEnum.PENDING ||
               job.status === MigrationStatusEnum.VALIDATING
      ).length,
    };
  }, [migrationJobs]);

  // Track all application IDs across jobs
  useEffect(() => {
    const allApplications = new Set<string>();
    migrationJobs.forEach((job) => {
      job.application_ids.forEach((appId) => {
        allApplications.add(appId);
      });
    });
    setApplications(Array.from(allApplications).sort());
  }, [migrationJobs]);

  // Fetch migration jobs
  const fetchMigrationJobs = async () => {
    try {
      const response = await brain.list_migration_jobs();
      const data = await response.json();
      setLastRefreshed(new Date());

      if (data.success) {
        setMigrationJobs(data.jobs);
        setError(null);
      } else {
        setError(data.message || "Failed to fetch migration jobs");
      }
    } catch (error) {
      console.error("Error fetching migration jobs:", error);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMigrationJobs();
  }, []);

  // Set up polling for updates
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      fetchMigrationJobs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isPolling, refreshInterval]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.applicationId) params.set("appId", filters.applicationId);
    if (filters.searchTerm) params.set("search", filters.searchTerm);
    params.set("sortBy", filters.sortBy);
    params.set("sortDirection", filters.sortDirection);
    if (activeJobId) params.set("jobId", activeJobId);
    setSearchParams(params);
  }, [filters, activeJobId, setSearchParams]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    return migrationJobs
      .filter((job) => {
        // Status filter
        if (filters.status && job.status !== filters.status) {
          return false;
        }

        // Application ID filter
        if (
          filters.applicationId &&
          !job.application_ids.includes(filters.applicationId)
        ) {
          return false;
        }

        // Search term (job ID, connection IDs)
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          return (
            job.job_id.toLowerCase().includes(searchLower) ||
            job.source_connection_id.toLowerCase().includes(searchLower) ||
            job.destination_connection_id.toLowerCase().includes(searchLower)
          );
        }

        return true;
      })
      .sort((a, b) => {
        const direction = filters.sortDirection === "asc" ? 1 : -1;

        switch (filters.sortBy) {
          case "created_at":
            return (
              (new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()) *
              direction
            );
          case "status":
            return (a.status > b.status ? 1 : -1) * direction;
          case "progress_percentage":
            return (a.progress_percentage - b.progress_percentage) * direction;
          default:
            return 0;
        }
      });
  }, [migrationJobs, filters]);

  // Handle refresh interval change
  const handleRefreshIntervalChange = (value: string) => {
    setRefreshInterval(parseInt(value));
    toast.success(`Auto-refresh set to ${parseInt(value) / 1000} seconds`);
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case MigrationStatusEnum.COMPLETED:
        return "bg-green-500";
      case MigrationStatusEnum.RUNNING:
      case MigrationStatusEnum.VALIDATING:
        return "bg-blue-500";
      case MigrationStatusEnum.PENDING:
      case MigrationStatusEnum.PAUSED:
        return "bg-yellow-500";
      case MigrationStatusEnum.FAILED:
        return "bg-red-500";
      case MigrationStatusEnum.CANCELLED:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case MigrationStatusEnum.COMPLETED:
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
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
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // Format date with time ago
  const formatDateWithTimeAgo = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return (
        <span title={format(date, "PPpp")}>
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      );
    } catch (e) {
      return dateStr;
    }
  };

  // Cancel job handler
  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await brain.cancel_migration_job({ job_id: jobId });
      const data = await response.json();

      if (data.status === "success") {
        toast.success("Migration job cancelled");
        fetchMigrationJobs(); // Refresh jobs list
      } else {
        toast.error(`Failed to cancel job: ${data.message}`);
      }
    } catch (error) {
      console.error("Error cancelling job:", error);
      toast.error("Error cancelling job");
    }
  };

  // Start new migration handler
  const handleStartNewMigration = () => {
    navigate("/MigrationExecution");
  };

  // View job details handler
  const handleViewJobDetails = (jobId: string) => {
    setActiveJobId(jobId);
  };

  // Handle sort toggle
  const handleSort = (column: "created_at" | "status" | "progress_percentage") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortDirection:
        prev.sortBy === column
          ? prev.sortDirection === "asc"
            ? "desc"
            : "asc"
          : "desc",
    }));
  };

  // Render sort icon
  const renderSortIcon = (column: "created_at" | "status" | "progress_percentage") => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground" />;
    }
    return filters.sortDirection === "asc" ? (
      <ArrowUpDown className="ml-1 h-3 w-3 rotate-180 text-foreground" />
    ) : (
      <ArrowUpDown className="ml-1 h-3 w-3 text-foreground" />
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Migration Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your database migration jobs
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                <span>{refreshInterval / 1000}s</span>
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Auto-refresh interval</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRefreshIntervalChange("5000")}>
                5 seconds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRefreshIntervalChange("10000")}>
                10 seconds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRefreshIntervalChange("30000")}>
                30 seconds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRefreshIntervalChange("60000")}>
                1 minute
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsPolling(!isPolling)}
                className="flex justify-between items-center"
              >
                {isPolling ? "Pause auto-refresh" : "Resume auto-refresh"}
                {isPolling ? <Clock className="h-4 w-4 ml-2" /> : <Play className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={fetchMigrationJobs}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          <Button onClick={handleStartNewMigration}>
            <PlusCircle className="h-4 w-4 mr-1" />
            New Migration
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Total Jobs</span>
            <div className="flex items-center space-x-2 mt-1">
              <Database className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{dashboardStats.totalJobs}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Running</span>
            <div className="flex items-center space-x-2 mt-1">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{dashboardStats.runningJobs}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Completed</span>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{dashboardStats.completedJobs}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Failed</span>
            <div className="flex items-center space-x-2 mt-1">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{dashboardStats.failedJobs}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col">
            <span className="text-muted-foreground text-sm">Pending</span>
            <div className="flex items-center space-x-2 mt-1">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{dashboardStats.pendingJobs}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last updated */}
      <div className="flex justify-end items-center">
        <span className="text-xs text-muted-foreground">
          Last updated: {format(lastRefreshed, "HH:mm:ss")} · 
          {isPolling ? (
            <span className="inline-flex items-center">
              <Loader2 className="inline h-3 w-3 animate-spin mx-1" />
              Auto-refreshing
            </span>
          ) : (
            "Auto-refresh paused"
          )}
        </span>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          {activeJobId && (
            <TabsTrigger value="details">Job Details</TabsTrigger>
          )}
        </TabsList>

        {/* All Jobs Tab Content */}
        <TabsContent value="jobs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by job ID or connection..."
                    className="pl-8"
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                  />
                </div>

                <Select
                  value={filters.status || ""}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: value || null,
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">  
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="All Statuses" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value={MigrationStatusEnum.RUNNING}>
                      Running
                    </SelectItem>
                    <SelectItem value={MigrationStatusEnum.COMPLETED}>
                      Completed
                    </SelectItem>
                    <SelectItem value={MigrationStatusEnum.FAILED}>
                      Failed
                    </SelectItem>
                    <SelectItem value={MigrationStatusEnum.PENDING}>
                      Pending
                    </SelectItem>
                    <SelectItem value={MigrationStatusEnum.CANCELLED}>
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>

                {applications.length > 0 && (
                  <Select
                    value={filters.applicationId || ""}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        applicationId: value || null,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">  
                        <Settings className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="All Applications" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Applications</SelectItem>
                      {applications.map((appId) => (
                        <SelectItem key={appId} value={appId}>
                          {appId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 md:px-3"
                  onClick={() =>
                    setFilters({
                      status: null,
                      applicationId: null,
                      searchTerm: "",
                      sortBy: "created_at",
                      sortDirection: "desc",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List Table */}
          {loading && migrationJobs.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="font-medium text-lg">Error Loading Jobs</h3>
                <p className="text-muted-foreground mt-1 max-w-md">{error}</p>
                <Button className="mt-4" onClick={fetchMigrationJobs}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No Migration Jobs Found</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  {filters.searchTerm || filters.status || filters.applicationId
                    ? "No jobs match your current filters. Try adjusting your search criteria."
                    : "There are no migration jobs yet. Start a new migration to get started."}
                </p>
                {(filters.searchTerm || filters.status || filters.applicationId) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      setFilters({
                        status: null,
                        applicationId: null,
                        searchTerm: "",
                        sortBy: "created_at",
                        sortDirection: "desc",
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>
                      <button
                        className="inline-flex items-center hover:text-accent-foreground"
                        onClick={() => handleSort("created_at")}
                      >
                        Created {renderSortIcon("created_at")}
                      </button>
                    </TableHead>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Source / Destination</TableHead>
                    <TableHead>Apps</TableHead>
                    <TableHead>
                      <button
                        className="inline-flex items-center hover:text-accent-foreground"
                        onClick={() => handleSort("progress_percentage")}
                      >
                        Progress {renderSortIcon("progress_percentage")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.job_id}>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        {formatDateWithTimeAgo(job.created_at)}
                        {job.end_time && (
                          <div className="text-xs text-muted-foreground">
                            Ended: {formatDateWithTimeAgo(job.end_time)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {job.job_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm flex items-center gap-1">
                            <Database className="h-3 w-3 text-blue-500" />
                            {job.source_connection_id}
                          </span>
                          <span className="text-sm flex items-center gap-1">
                            <Database className="h-3 w-3 text-green-500" />
                            {job.destination_connection_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{job.application_ids.length}</Badge>
                          {job.application_ids.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:text-accent-foreground hover:bg-accent hover:text-accent-foreground h-7 w-7">
                                <span className="sr-only">Show applications</span>
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Applications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <ScrollArea className="h-[200px]">
                                  {job.application_ids.map((appId) => (
                                    <DropdownMenuItem key={appId}>
                                      {appId}
                                    </DropdownMenuItem>
                                  ))}
                                </ScrollArea>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{Math.round(job.progress_percentage)}%</span>
                          </div>
                          <Progress
                            value={job.progress_percentage}
                            className={`h-2 ${getStatusColor(job.status)}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewJobDetails(job.job_id)}
                          >
                            Details
                          </Button>
                          {job.status === MigrationStatusEnum.RUNNING && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleCancelJob(job.job_id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Active Jobs Tab Content */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {loading && migrationJobs.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                  <h3 className="font-medium text-lg">Error Loading Jobs</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">{error}</p>
                  <Button className="mt-4" onClick={fetchMigrationJobs}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {migrationJobs.filter(job => 
                  job.status === MigrationStatusEnum.RUNNING || 
                  job.status === MigrationStatusEnum.VALIDATING
                ).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <Activity className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg">No Active Jobs</h3>
                      <p className="text-muted-foreground mt-1 max-w-md">
                        There are no jobs currently running. Start a new migration or check completed jobs.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  migrationJobs
                    .filter(
                      (job) =>
                        job.status === MigrationStatusEnum.RUNNING ||
                        job.status === MigrationStatusEnum.VALIDATING
                    )
                    .map((job) => (
                      <Card key={job.job_id} className="overflow-hidden">
                        <div className="h-1 bg-blue-500"></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                Job #{job.job_id}
                                {getStatusBadge(job.status)}
                              </CardTitle>
                              <CardDescription>
                                Created {formatDateWithTimeAgo(job.created_at)}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewJobDetails(job.job_id)}
                              >
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={() => handleCancelJob(job.job_id)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Source</h4>
                              <p className="text-sm">{job.source_connection_id}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Destination</h4>
                              <p className="text-sm">{job.destination_connection_id}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Applications</h4>
                              <p className="text-sm">{job.application_ids.length} applications</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium">Progress</h4>
                              <span className="text-sm">
                                {Math.round(job.progress_percentage)}%
                              </span>
                            </div>
                            <Progress value={job.progress_percentage} className="h-2" />
                          </div>
                          
                          {job.table_statuses.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Tables</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {job.table_statuses
                                  .filter(table => 
                                    table.status === MigrationStatusEnum.RUNNING ||
                                    table.status === MigrationStatusEnum.PENDING
                                  )
                                  .slice(0, 4)
                                  .map((table) => (
                                    <div 
                                      key={table.table_name} 
                                      className="rounded-md border p-3"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-sm">
                                          {table.table_name}
                                        </span>
                                        {getStatusBadge(table.status)}
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span>
                                            {table.records_processed.toLocaleString()} / {table.records_total.toLocaleString()} records
                                          </span>
                                          <span>
                                            {table.records_total > 0
                                              ? Math.round((table.records_processed / table.records_total) * 100)
                                              : 0}%
                                          </span>
                                        </div>
                                        <Progress
                                          value={table.records_total > 0 ? (table.records_processed / table.records_total) * 100 : 0}
                                          className={`h-1 ${table.status === MigrationStatusEnum.RUNNING ? "bg-blue-500" : "bg-yellow-500"}`}
                                        />
                                      </div>
                                    </div>
                                  ))}                                  
                              </div>
                              {job.table_statuses.filter(table => 
                                table.status === MigrationStatusEnum.RUNNING ||
                                table.status === MigrationStatusEnum.PENDING
                              ).length > 4 && (
                                <div className="mt-2 text-center">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleViewJobDetails(job.job_id)}
                                  >
                                    View all tables
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* Job Details Tab Content */}
        <TabsContent value="details" className="space-y-4">
          {activeJobId ? (
            <MigrationStatus
              jobId={activeJobId}
              autoRefresh={true}
              onComplete={() => fetchMigrationJobs()}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
                <h3 className="font-medium text-lg">No Job Selected</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  Please select a job to view its details.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
};

export default MigrationDashboard;