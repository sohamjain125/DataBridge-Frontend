import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import brain from "brain";
import AppLayout from "../components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { format } from "date-fns";
import { AlertTriangle, ChevronDown, ChevronUp, Database, Filter, Search } from "lucide-react";
import { ConnectionProfile } from "types";

// Interface for Application Item
interface Application {
  application_id: string;
  application_name: string;
  description: string | null;
  version: string | null;
  creation_date: string | null;
  last_modified_date: string | null;
  status: string | null;
  size: number | null;
  owner: string | null;
  environment: string | null;
  is_critical: boolean;
  additional_metadata?: Record<string, any> | null;
}

// Interface for Pagination Info
interface PaginationInfo {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

// Interface for Application Details extended data
interface ApplicationDetails extends Application {
  database_objects?: {
    tables: Array<{ name: string; record_count: number; size_kb: number }>;
    views: Array<{ name: string }>;
    stored_procedures: Array<{ name: string }>;
  };
  dependencies?: string[];
}

// Component to format file size display
const FileSizeDisplay = ({ bytes }: { bytes: number | null }) => {
  if (bytes === null) return <span>-</span>;
  
  if (bytes < 1024) return <span>{bytes} B</span>;
  if (bytes < 1024 * 1024) return <span>{(bytes / 1024).toFixed(2)} KB</span>;
  if (bytes < 1024 * 1024 * 1024) return <span>{(bytes / (1024 * 1024)).toFixed(2)} MB</span>;
  return <span>{(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB</span>;
};

export default function ApplicationSelector() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get connection profile id from query params
  const connectionProfileId = searchParams.get('connectionId') || "";
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [connectionProfile, setConnectionProfile] = useState<ConnectionProfile | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    page: 1,
    page_size: 10,
    total_count: 0,
    total_pages: 0
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("application_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Application details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentApplicationDetails, setCurrentApplicationDetails] = useState<ApplicationDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Load connection profile
  useEffect(() => {
    if (!connectionProfileId) {
      toast.error("No connection profile selected");
      navigate("/connection-config");
      return;
    }
    
    // Fetch connection profile
    const fetchConnectionProfile = async () => {
      try {
        const response = await brain.get_connection_profile({ profileId: connectionProfileId });
        const data = await response.json();
        setConnectionProfile(data);
      } catch (error) {
        console.error("Error fetching connection profile:", error);
        toast.error("Failed to load connection profile");
        navigate("/connection-config");
      }
    };
    
    fetchConnectionProfile();
  }, [connectionProfileId, navigate]);
  
  // Load saved selection
  useEffect(() => {
    if (!connectionProfileId) return;
    
    const fetchSavedSelection = async () => {
      try {
        const response = await fetch(`/selected/${connectionProfileId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedApplicationIds(data.selected_application_ids || []);
        }
      } catch (error) {
        console.error("Error fetching saved selection:", error);
        // Non-critical, so no toast
      }
    };
    
    fetchSavedSelection();
  }, [connectionProfileId]);
  
  // Load applications
  const fetchApplications = async (page = paginationInfo.page) => {
    if (!connectionProfileId) return;
    
    setIsLoading(true);
    
    try {
      const response = await brain.list_applications({
        connection_profile_id: connectionProfileId,
        page,
        page_size: paginationInfo.page_size,
        search_term: searchTerm || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      const data = await response.json();
      setApplications(data.applications);
      setPaginationInfo({
        page: data.page,
        page_size: data.page_size,
        total_count: data.total_count,
        total_pages: data.total_pages
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (connectionProfileId) {
      fetchApplications(1); // Reset to first page when search/sort changes
    }
  }, [connectionProfileId, searchTerm, sortBy, sortOrder]);
  
  // Handle pagination change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationInfo.total_pages) return;
    fetchApplications(newPage);
  };
  
  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications(1); // Reset to first page on new search
  };
  
  // Handle selection toggle
  const toggleSelection = (applicationId: string) => {
    setSelectedApplicationIds(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };
  
  // Handle select all on current page
  const toggleSelectAllOnPage = () => {
    if (applications.length === 0) return;
    
    // Check if all apps on current page are selected
    const currentPageIds = applications.map(app => app.application_id);
    const allSelected = currentPageIds.every(id => selectedApplicationIds.includes(id));
    
    if (allSelected) {
      // Deselect all on current page
      setSelectedApplicationIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedApplicationIds(prev => {
        const newSelection = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };
  
  // Handle view details
  const handleViewDetails = async (applicationId: string) => {
    setLoadingDetails(true);
    setDetailsOpen(true);
    
    try {
      const response = await brain.get_application_details({
        connection_profile_id: connectionProfileId,
        application_id: applicationId
      });
      
      const data = await response.json();
      setCurrentApplicationDetails(data.application);
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast.error("Failed to load application details");
      setDetailsOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };
  
  // Save selection
  const saveSelection = async () => {
    if (!connectionProfileId || selectedApplicationIds.length === 0) {
      toast.error("No applications selected");
      return;
    }
    
    try {
      const response = await brain.select_applications({
        connection_profile_id: connectionProfileId,
        application_ids: selectedApplicationIds,
        select_all: false
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`${data.selected_count} applications selected for migration`);
        navigate(`/mapping?connectionId=${connectionProfileId}`);
      } else {
        toast.error(data.message || "Failed to save selection");
      }
    } catch (error) {
      console.error("Error saving application selection:", error);
      toast.error("Failed to save application selection");
    }
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedApplicationIds([]);
  };
  
  // Generate page links for pagination
  const generatePageLinks = () => {
    const { page, total_pages } = paginationInfo;
    const pageLinks = [];
    
    if (total_pages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total_pages; i++) {
        pageLinks.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={page === i} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first and last pages, and ellipses as needed
      // First page
      pageLinks.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={page === 1} onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Determine range of pages to show around current page
      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(total_pages - 1, page + 1);
      
      // Adjust to show 3 pages minimum
      if (endPage - startPage < 2) {
        if (startPage === 2) {
          endPage = Math.min(4, total_pages - 1);
        } else {
          startPage = Math.max(2, total_pages - 3);
        }
      }
      
      // Show ellipsis before startPage if needed
      if (startPage > 2) {
        pageLinks.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Pages around current
      for (let i = startPage; i <= endPage; i++) {
        pageLinks.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={page === i} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Show ellipsis after endPage if needed
      if (endPage < total_pages - 1) {
        pageLinks.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Last page
      pageLinks.push(
        <PaginationItem key={total_pages}>
          <PaginationLink isActive={page === total_pages} onClick={() => handlePageChange(total_pages)}>
            {total_pages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageLinks;
  };
  
  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    
    return sortOrder === "asc" ? 
      <ChevronUp className="h-4 w-4 inline ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline ml-1" />;
  };
  
  return (
    <AppLayout>
      {/* Main Content */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Application Selector</h1>
              {connectionProfile && (
                <p className="text-muted-foreground mt-1">
                  Source Database: <span className="font-medium">{connectionProfile.name}</span> ({connectionProfile.server}/{connectionProfile.database})
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/connection-config`)}
              >
                <Database className="h-4 w-4 mr-2" />
                Change Source
              </Button>
              
              <Button 
                onClick={saveSelection} 
                disabled={selectedApplicationIds.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue with {selectedApplicationIds.length} Selected
              </Button>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <form onSubmit={handleSearch} className="flex-1 w-full">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search applications..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application_name">Name</SelectItem>
                      <SelectItem value="creation_date">Creation Date</SelectItem>
                      <SelectItem value="last_modified_date">Modified Date</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "asc" | "desc")}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Applications Table */}
          <Card>
            <CardHeader className="py-4 px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle>Applications</CardTitle>
                  <CardDescription>
                    {paginationInfo.total_count} applications found
                  </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={toggleSelectAllOnPage}
                    className="text-xs sm:text-sm h-8"
                    disabled={applications.length === 0}
                  >
                    {applications.length > 0 && applications.every(app => selectedApplicationIds.includes(app.application_id)) ?
                      "Deselect All on Page" : "Select All on Page"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={clearSelection} 
                    disabled={selectedApplicationIds.length === 0}
                    className="text-xs sm:text-sm h-8"
                  >
                    Clear Selection ({selectedApplicationIds.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="border-t border-border">
                <div className="relative overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">
                          <span className="sr-only">Selection</span>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("application_name")}
                        >
                          <span className="flex items-center">
                            Name {renderSortIndicator("application_name")}
                          </span>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("environment")}
                        >
                          <span className="flex items-center">
                            Environment {renderSortIndicator("environment")}
                          </span>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("status")}
                        >
                          <span className="flex items-center">
                            Status {renderSortIndicator("status")}
                          </span>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("size")}
                        >
                          <span className="flex items-center">
                            Size {renderSortIndicator("size")}
                          </span>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => handleSort("last_modified_date")}
                        >
                          <span className="flex items-center">
                            Last Modified {renderSortIndicator("last_modified_date")}
                          </span>
                        </TableHead>
                        <TableHead className="w-12 text-center">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                            Loading applications...
                          </TableCell>
                        </TableRow>
                      ) : applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                            No applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        applications.map((app) => (
                          <TableRow key={app.application_id}>
                            <TableCell className="text-center">
                              <Checkbox 
                                checked={selectedApplicationIds.includes(app.application_id)}
                                onCheckedChange={() => toggleSelection(app.application_id)}
                                id={`select-${app.application_id}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{app.application_name}</div>
                              {app.is_critical && (
                                <div className="flex items-center mt-1">
                                  <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                                  <span className="text-xs text-amber-500">Critical System</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={`
                                  ${app.environment === "Production" ? "border-green-500/20 bg-green-500/10 text-green-500" : ""}
                                  ${app.environment === "Development" ? "border-blue-500/20 bg-blue-500/10 text-blue-500" : ""}
                                  ${app.environment === "Testing" ? "border-orange-500/20 bg-orange-500/10 text-orange-500" : ""}
                                `}
                              >
                                {app.environment || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={`
                                  ${app.status === "Active" ? "border-green-500/20 bg-green-500/10 text-green-500" : ""}
                                  ${app.status === "Inactive" ? "border-slate-500/20 bg-slate-500/10 text-slate-500" : ""}
                                `}
                              >
                                {app.status || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <FileSizeDisplay bytes={app.size} />
                            </TableCell>
                            <TableCell>
                              {app.last_modified_date ? (
                                new Date(app.last_modified_date).toLocaleDateString()
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewDetails(app.application_id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            
            {/* Pagination */}
            {!isLoading && applications.length > 0 && (
              <CardFooter className="py-4 px-6 border-t border-border flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(paginationInfo.page - 1)} 
                        disabled={paginationInfo.page === 1}
                      />
                    </PaginationItem>
                    
                    {generatePageLinks()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(paginationInfo.page + 1)} 
                        disabled={paginationInfo.page === paginationInfo.total_pages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}
          </Card>
          
          {/* Application Details Dialog */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {loadingDetails ? "Loading Application Details..." : currentApplicationDetails?.application_name}
                </DialogTitle>
                <DialogDescription>
                  Detailed information about the selected application
                </DialogDescription>
              </DialogHeader>
              
              {loadingDetails ? (
                <div className="py-10 text-center text-muted-foreground">
                  Loading application details...
                </div>
              ) : currentApplicationDetails ? (
                <div className="space-y-6 py-2">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Application ID</h3>
                      <p>{currentApplicationDetails.application_id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Version</h3>
                      <p>{currentApplicationDetails.version || "Unknown"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Environment</h3>
                      <p>{currentApplicationDetails.environment || "Unknown"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                      <p>{currentApplicationDetails.status || "Unknown"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Owner</h3>
                      <p>{currentApplicationDetails.owner || "Unknown"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Size</h3>
                      <p><FileSizeDisplay bytes={currentApplicationDetails.size} /></p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                      <p>{currentApplicationDetails.creation_date ? new Date(currentApplicationDetails.creation_date).toLocaleDateString() : "Unknown"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Modified</h3>
                      <p>{currentApplicationDetails.last_modified_date ? new Date(currentApplicationDetails.last_modified_date).toLocaleDateString() : "Unknown"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-sm">{currentApplicationDetails.description || "No description available"}</p>
                  </div>
                  
                  {/* Additional Metadata */}
                  {currentApplicationDetails.additional_metadata && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">Additional Metadata</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(currentApplicationDetails.additional_metadata).map(([key, value]) => (
                            <div key={key}>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">{key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</h4>
                              <p className="text-sm">{value?.toString() || "N/A"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Database Objects */}
                  {currentApplicationDetails.database_objects && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">Database Objects</h3>
                        
                        <h4 className="text-sm font-medium mb-1">Tables</h4>
                        <div className="overflow-x-auto">
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Record Count</TableHead>
                                <TableHead>Size</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentApplicationDetails.database_objects.tables.map(table => (
                                <TableRow key={table.name}>
                                  <TableCell className="font-mono text-xs">{table.name}</TableCell>
                                  <TableCell>{table.record_count.toLocaleString()}</TableCell>
                                  <TableCell><FileSizeDisplay bytes={table.size_kb * 1024} /></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Views</h4>
                            <ul className="list-disc list-inside text-sm pl-2">
                              {currentApplicationDetails.database_objects.views.map(view => (
                                <li key={view.name} className="font-mono">{view.name}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Stored Procedures</h4>
                            <ul className="list-disc list-inside text-sm pl-2">
                              {currentApplicationDetails.database_objects.stored_procedures.map(proc => (
                                <li key={proc.name} className="font-mono">{proc.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Dependencies */}
                  {currentApplicationDetails.dependencies && currentApplicationDetails.dependencies.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-2">Dependencies</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentApplicationDetails.dependencies.map(dep => (
                            <Badge key={dep} variant="secondary">{dep}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-muted-foreground">No application details available</div>
              )}
              
              <DialogFooter>
                <div className="w-full flex justify-between items-center">
                  <div>
                    {currentApplicationDetails && !selectedApplicationIds.includes(currentApplicationDetails.application_id) ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (currentApplicationDetails) {
                            toggleSelection(currentApplicationDetails.application_id);
                          }
                        }}
                      >
                        Add to Selection
                      </Button>
                    ) : currentApplicationDetails ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (currentApplicationDetails) {
                            toggleSelection(currentApplicationDetails.application_id);
                          }
                        }}
                      >
                        Remove from Selection
                      </Button>
                    ) : null}
                  </div>
                  
                  <Button onClick={() => setDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Action Buttons at Bottom */}
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/connection-config")}
            >
              Back to Connections
            </Button>
            
            <Button 
              onClick={saveSelection} 
              disabled={selectedApplicationIds.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue with {selectedApplicationIds.length} Selected
            </Button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}