import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Database, Home, ArrowLeft } from "lucide-react";
import SchemaVisualizer, { DatabaseSchema } from "components/SchemaVisualizer";
import brain from "brain";

// Default empty schema
const emptySchema: DatabaseSchema = {
  tables: [],
  relations: []
};

export default function DatabaseSchemaViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [sourceConnectionId, setSourceConnectionId] = useState<string | null>(null);
  const [destConnectionId, setDestConnectionId] = useState<string | null>(null);
  const [sourceSchema, setSourceSchema] = useState<DatabaseSchema>(emptySchema);
  const [destSchema, setDestSchema] = useState<DatabaseSchema>(emptySchema);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [destLoading, setDestLoading] = useState(false);
  const [sourceDbName, setSourceDbName] = useState<string>("Source Database");
  const [destDbName, setDestDbName] = useState<string>("Destination Database");
  
  // Load connection info from URL params
  useEffect(() => {
    const sourceId = searchParams.get("sourceId");
    const destId = searchParams.get("destId");
    
    if (sourceId) {
      setSourceConnectionId(sourceId);
    }
    
    if (destId) {
      setDestConnectionId(destId);
    }
    
    // If we have connection IDs, fetch schema information
    if (sourceId) {
      fetchSchema(sourceId, "source");
    }
    
    if (destId) {
      fetchSchema(destId, "destination");
    }
  }, [searchParams]);
  
  // Function to fetch schema information
  const fetchSchema = async (connectionId: string, type: "source" | "destination") => {
    if (type === "source") {
      setSourceLoading(true);
    } else {
      setDestLoading(true);
    }
    
    try {
      const response = await brain.get_database_schema({
        connection_profile_id: connectionId
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (type === "source") {
          setSourceSchema(data.schema);
          // Here we would typically fetch the connection name from a list of connections
          // For now, we'll just use a placeholder
          setSourceDbName(`Source Database (${data.schema.tables.length} tables)`);
        } else {
          setDestSchema(data.schema);
          setDestDbName(`Destination Database (${data.schema.tables.length} tables)`);
        }
      } else {
        toast.error(`Failed to load ${type} database schema: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error fetching ${type} schema:`, error);
      toast.error(`Failed to load ${type} database schema`);
    } finally {
      if (type === "source") {
        setSourceLoading(false);
      } else {
        setDestLoading(false);
      }
    }
  };
  
  // Function to go back to connection config
  const handleGoBack = () => {
    navigate("/connection-config");
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-bold text-lg">DataBridge Pro</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <Home className="h-5 w-5 mr-1" />
              Home
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  className="mr-2 h-8 w-8 p-0" 
                  onClick={handleGoBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">Database Schema Comparison</h1>
              </div>
              <p className="text-muted-foreground mt-1">
                Compare the source and destination database schemas to plan your migration mapping
              </p>
            </div>
          </div>
          
          {/* Schema Viewers */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Source Schema */}
            <SchemaVisualizer
              schema={sourceSchema}
              title="Source Database Schema"
              isLoading={sourceLoading}
              databaseName={sourceDbName}
              databaseType="source"
              databaseId={sourceConnectionId || undefined}
            />
            
            {/* Destination Schema */}
            <SchemaVisualizer
              schema={destSchema}
              title="Destination Database Schema"
              isLoading={destLoading}
              databaseName={destDbName}
              databaseType="destination"
              databaseId={destConnectionId || undefined}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="outline" onClick={handleGoBack}>
              Back to Connection Config
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/mapping")}
              disabled={!sourceConnectionId || !destConnectionId}
            >
              Proceed to Mapping
            </Button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-bold">DataBridge Pro</span>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DataBridge Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
