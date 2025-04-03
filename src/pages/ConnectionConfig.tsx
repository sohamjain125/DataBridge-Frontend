import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import brain from "brain";
import AppLayout from "../components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ConnectionProfile, ConnectionProfileRequest, ConnectionTestRequest } from "types";

export default function ConnectionConfig() {
  const navigate = useNavigate();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("source");
  const [connectionProfiles, setConnectionProfiles] = useState<ConnectionProfile[]>([]);
  
  // Form state for connection testing
  const [connectionForm, setConnectionForm] = useState<ConnectionTestRequest>({
    server: "",
    database: "",
    auth_type: "windows",
    username: "",
    password: "",
    port: undefined,
    trust_certificate: true
  });
  
  // Form state for saving profiles
  const [profileForm, setProfileForm] = useState<ConnectionProfileRequest>({
    name: "",
    description: "",
    server: "",
    database: "",
    auth_type: "windows",
    username: "",
    password: "",
    port: undefined,
    trust_certificate: true,
    type: "source"
  });

  // Fetch saved connection profiles
  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await brain.list_connection_profiles();
      const data = await response.json();
      setConnectionProfiles(data.profiles);
    } catch (error) {
      console.error("Error fetching connection profiles:", error);
      toast.error("Failed to load saved connection profiles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Update profile form when tab changes
  useEffect(() => {
    setProfileForm(prev => ({ ...prev, type: activeTab }));
  }, [activeTab]);

  // Handle form field changes
  const handleConnectionFormChange = (field: string, value: any) => {
    setConnectionForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileFormChange = (field: string, value: any) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  // Test connection
  const handleTestConnection = async () => {
    try {
      setIsTestingConnection(true);
      
      // Create request with only the fields needed for testing
      const testRequest: ConnectionTestRequest = {
        server: connectionForm.server,
        database: connectionForm.database,
        auth_type: connectionForm.auth_type,
        trust_certificate: connectionForm.trust_certificate
      };
      
      // Add optional fields only if they have values
      if (connectionForm.auth_type === "sql") {
        testRequest.username = connectionForm.username;
        testRequest.password = connectionForm.password;
      }
      
      if (connectionForm.port) {
        testRequest.port = connectionForm.port;
      }
      
      const response = await brain.test_connection(testRequest);
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("An error occurred while testing the connection");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save connection profile
  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!profileForm.name || !profileForm.server || !profileForm.database) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Validate SQL auth fields
      if (profileForm.auth_type === "sql" && (!profileForm.username || !profileForm.password)) {
        toast.error("Username and password are required for SQL Server authentication");
        return;
      }
      
      setIsSavingProfile(true);
      const response = await brain.create_connection_profile(profileForm);
      const result = await response.json();
      
      toast.success(`Connection profile "${profileForm.name}" saved successfully`);
      fetchProfiles(); // Refresh the profiles list
      
      // Reset form
      setProfileForm({
        name: "",
        description: "",
        server: profileForm.server,
        database: profileForm.database,
        auth_type: profileForm.auth_type,
        username: profileForm.username,
        password: profileForm.password,
        port: profileForm.port,
        trust_certificate: profileForm.trust_certificate,
        type: activeTab
      });
    } catch (error) {
      console.error("Error saving connection profile:", error);
      toast.error("Failed to save connection profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Load profile into form
  const loadProfile = (profile: ConnectionProfile) => {
    setConnectionForm({
      server: profile.server,
      database: profile.database,
      auth_type: profile.auth_type,
      username: profile.username || "",
      password: profile.password || "",
      port: profile.port,
      trust_certificate: profile.trust_certificate
    });
    
    setProfileForm({
      name: profile.name,
      description: profile.description || "",
      server: profile.server,
      database: profile.database,
      auth_type: profile.auth_type,
      username: profile.username || "",
      password: profile.password || "",
      port: profile.port,
      trust_certificate: profile.trust_certificate,
      type: profile.type
    });
    
    setActiveTab(profile.type);
  };

  // Delete a profile
  const deleteProfile = async (profileId: string, profileName: string) => {
    if (window.confirm(`Are you sure you want to delete the connection profile "${profileName}"?`)) {
      try {
        await brain.delete_connection_profile({ profileId });
        toast.success(`Connection profile "${profileName}" deleted successfully`);
        fetchProfiles(); // Refresh the profiles list
      } catch (error) {
        console.error("Error deleting connection profile:", error);
        toast.error("Failed to delete connection profile");
      }
    }
  };

  // State for the selected source and destination profiles
  const [selectedSourceProfile, setSelectedSourceProfile] = useState<string | null>(null);
  const [selectedDestProfile, setSelectedDestProfile] = useState<string | null>(null);

  // Set a profile as selected
  const setProfileAsSelected = (profile: ConnectionProfile) => {
    if (profile.type === "source") {
      setSelectedSourceProfile(profile.id);
    } else {
      setSelectedDestProfile(profile.id);
    }
    toast.success(`Selected ${profile.name} as ${profile.type} database`);
  };

  // Navigate to application selection
  const handleSelectApplications = () => {
    if (!selectedSourceProfile) {
      toast.error("Please select a source database first");
      return;
    }
    navigate(`/application-selector?connectionId=${selectedSourceProfile}`);
  };

  return (
    <AppLayout>
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Database Connection Configuration</h1>
          
          {/* Migration Setup - Selected Connections */}
          {(selectedSourceProfile || selectedDestProfile) && (
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <CardTitle>Migration Setup</CardTitle>
                <CardDescription>Selected connection profiles for migration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Database</Label>
                    <div className="border rounded-md p-3 bg-secondary/30">
                      {selectedSourceProfile ? (
                        connectionProfiles.find(p => p.id === selectedSourceProfile) ? (
                          <div>
                            <div className="font-medium">
                              {connectionProfiles.find(p => p.id === selectedSourceProfile)?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {connectionProfiles.find(p => p.id === selectedSourceProfile)?.server}/
                              {connectionProfiles.find(p => p.id === selectedSourceProfile)?.database}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">Selected profile not found</div>
                        )
                      ) : (
                        <div className="text-muted-foreground">No source selected</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Destination Database</Label>
                    <div className="border rounded-md p-3 bg-secondary/30">
                      {selectedDestProfile ? (
                        connectionProfiles.find(p => p.id === selectedDestProfile) ? (
                          <div>
                            <div className="font-medium">
                              {connectionProfiles.find(p => p.id === selectedDestProfile)?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {connectionProfiles.find(p => p.id === selectedDestProfile)?.server}/
                              {connectionProfiles.find(p => p.id === selectedDestProfile)?.database}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">Selected profile not found</div>
                        )
                      ) : (
                        <div className="text-muted-foreground">No destination selected</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  onClick={handleSelectApplications}
                  disabled={!selectedSourceProfile}
                  className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Select Applications
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Saved Connections */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Connections</CardTitle>
                  <CardDescription>Your stored connection profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connectionProfiles.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {isLoading ? "Loading..." : "No saved connections yet"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="font-medium mb-1">Source Connections</div>
                      {connectionProfiles.filter(p => p.type === "source").length === 0 ? (
                        <div className="text-sm text-muted-foreground pl-4 py-2">No source connections</div>
                      ) : (
                        connectionProfiles
                          .filter(p => p.type === "source")
                          .map(profile => (
                            <div key={profile.id} className="border rounded-md p-3 shadow-sm bg-card">
                              <div className="flex justify-between items-start">
                                <div className="font-medium">{profile.name}</div>
                                <div className="flex space-x-1">
                                  <div className="flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0"
                                      onClick={() => setProfileAsSelected(profile)}
                                      title="Select this profile"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0"
                                      onClick={() => loadProfile(profile)}
                                      title="Load this profile for editing"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    </Button>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteProfile(profile.id, profile.name)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">{profile.server}/{profile.database}</div>
                            </div>
                          ))
                      )}
                    
                      <div className="font-medium mb-1 mt-6">Destination Connections</div>
                      {connectionProfiles.filter(p => p.type === "destination").length === 0 ? (
                        <div className="text-sm text-muted-foreground pl-4 py-2">No destination connections</div>
                      ) : (
                        connectionProfiles
                          .filter(p => p.type === "destination")
                          .map(profile => (
                            <div key={profile.id} className="border rounded-md p-3 shadow-sm bg-card">
                              <div className="flex justify-between items-start">
                                <div className="font-medium">{profile.name}</div>
                                <div className="flex space-x-1">
                                  <div className="flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0"
                                      onClick={() => setProfileAsSelected(profile)}
                                      title="Select this profile"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 w-7 p-0"
                                      onClick={() => loadProfile(profile)}
                                      title="Load this profile for editing"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => deleteProfile(profile.id, profile.name)}
                                      title="Delete this profile"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">{profile.server}/{profile.database}</div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - New Connection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configure Database Connection</CardTitle>
                  <CardDescription>Set up a new SQL Server connection</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="source">Source Database</TabsTrigger>
                      <TabsTrigger value="destination">Destination Database</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="space-y-5">
                    {/* Connection Profile Name & Description */}
                    <div>
                      <Label htmlFor="profile-name" className="text-base font-medium">Profile Details</Label>
                      <div className="mt-2 grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="profile-name">Profile Name <span className="text-destructive">*</span></Label>
                          <Input 
                            id="profile-name"
                            value={profileForm.name}
                            onChange={(e) => handleProfileFormChange("name", e.target.value)}
                            placeholder="Production Server"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-description">Description</Label>
                          <Textarea 
                            id="profile-description"
                            value={profileForm.description || ""}
                            onChange={(e) => handleProfileFormChange("description", e.target.value)}
                            placeholder="Optional description of this connection profile"
                            className="resize-none h-20"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Connection Settings */}
                    <div>
                      <Label htmlFor="server" className="text-base font-medium">Connection Settings</Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="server">Server Name <span className="text-destructive">*</span></Label>
                          <Input 
                            id="server"
                            value={connectionForm.server}
                            onChange={(e) => {
                              handleConnectionFormChange("server", e.target.value);
                              handleProfileFormChange("server", e.target.value);
                            }}
                            placeholder="localhost or SQL Server instance name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="port">Port (Optional)</Label>
                          <Input 
                            id="port"
                            type="number"
                            min="1"
                            max="65535"
                            value={connectionForm.port || ""}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value) : undefined;
                              handleConnectionFormChange("port", value);
                              handleProfileFormChange("port", value);
                            }}
                            placeholder="1433"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="database">Database Name <span className="text-destructive">*</span></Label>
                          <Input 
                            id="database"
                            value={connectionForm.database}
                            onChange={(e) => {
                              handleConnectionFormChange("database", e.target.value);
                              handleProfileFormChange("database", e.target.value);
                            }}
                            placeholder="master"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auth-type">Authentication Type</Label>
                          <Select 
                            value={connectionForm.auth_type}
                            onValueChange={(value) => {
                              handleConnectionFormChange("auth_type", value);
                              handleProfileFormChange("auth_type", value);
                            }}
                          >
                            <SelectTrigger id="auth-type">
                              <SelectValue placeholder="Select authentication type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="windows">Windows Authentication</SelectItem>
                              <SelectItem value="sql">SQL Server Authentication</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* SQL Authentication */}
                    {connectionForm.auth_type === "sql" && (
                      <div>
                        <Label className="text-base font-medium">SQL Server Credentials</Label>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
                            <Input 
                              id="username"
                              value={connectionForm.username || ""}
                              onChange={(e) => {
                                handleConnectionFormChange("username", e.target.value);
                                handleProfileFormChange("username", e.target.value);
                              }}
                              placeholder="sa"
                              required={connectionForm.auth_type === "sql"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                            <Input 
                              id="password"
                              type="password"
                              value={connectionForm.password || ""}
                              onChange={(e) => {
                                handleConnectionFormChange("password", e.target.value);
                                handleProfileFormChange("password", e.target.value);
                              }}
                              placeholder="Enter password"
                              required={connectionForm.auth_type === "sql"}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Advanced Options */}
                    <div>
                      <Label className="text-base font-medium">Advanced Options</Label>
                      <div className="mt-2 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="trust-certificate"
                            checked={connectionForm.trust_certificate}
                            onCheckedChange={(checked) => {
                              handleConnectionFormChange("trust_certificate", checked);
                              handleProfileFormChange("trust_certificate", checked);
                            }}
                          />
                          <Label htmlFor="trust-certificate">Trust Server Certificate</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button 
                    variant="outline" 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !connectionForm.server || !connectionForm.database || 
                              (connectionForm.auth_type === "sql" && (!connectionForm.username || !connectionForm.password))}
                  >
                    {isTestingConnection ? "Testing..." : "Test Connection"}
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || !profileForm.name || !profileForm.server || !profileForm.database || 
                              (profileForm.auth_type === "sql" && (!profileForm.username || !profileForm.password))}
                  >
                    {isSavingProfile ? "Saving..." : "Save Connection Profile"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}