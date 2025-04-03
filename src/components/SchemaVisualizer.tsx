import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronDown, ChevronRight, Database, ExternalLink, Key, Lock } from "lucide-react";

// Types for database schema
export interface TableColumn {
  name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  is_nullable: boolean;
  is_indexed: boolean;
  foreign_key_table?: string;
  foreign_key_column?: string;
  description?: string;
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
  row_count?: number;
  size_kb?: number;
  has_data: boolean;
  description?: string;
}

export interface DatabaseRelation {
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
  relationship_type: string;
}

export interface DatabaseSchema {
  tables: TableSchema[];
  relations: DatabaseRelation[];
}

// File size display helper
const FileSizeDisplay = ({ bytes }: { bytes: number | null }) => {
  if (bytes === null) return <span>-</span>;
  
  if (bytes < 1024) return <span>{bytes} B</span>;
  if (bytes < 1024 * 1024) return <span>{(bytes / 1024).toFixed(2)} KB</span>;
  if (bytes < 1024 * 1024 * 1024) return <span>{(bytes / (1024 * 1024)).toFixed(2)} MB</span>;
  return <span>{(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB</span>;
};

// SchemaVisualizer component props
interface SchemaVisualizerProps {
  schema: DatabaseSchema;
  title?: string;
  isLoading?: boolean;
  containerClassName?: string;
  databaseId?: string;
  databaseName?: string;
  databaseType?: "source" | "destination";
}

const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({
  schema,
  title = "Database Schema",
  isLoading = false,
  containerClassName = "",
  databaseId,
  databaseName,
  databaseType
}) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [filterText, setFilterText] = useState<string>("");
  
  // Toggle expansion of a table
  const toggleTableExpanded = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };
  
  // Filter tables based on search text
  const filteredTables = schema.tables.filter(table => 
    filterText === "" || 
    table.name.toLowerCase().includes(filterText.toLowerCase()) ||
    table.description?.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // Sort tables alphabetically
  const sortedTables = [...filteredTables].sort((a, b) => a.name.localeCompare(b.name));
  
  // Get relations for a specific table
  const getTableRelations = (tableName: string) => {
    const incomingRelations = schema.relations.filter(rel => rel.target_table === tableName);
    const outgoingRelations = schema.relations.filter(rel => rel.source_table === tableName);
    
    return { incomingRelations, outgoingRelations };
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className={`${containerClassName}`}>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 animate-pulse text-muted-foreground/70" />
            <p>Loading schema information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render empty state
  if (schema.tables.length === 0) {
    return (
      <Card className={`${containerClassName}`}>
        <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/70" />
            <p>No schema information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render main component
  return (
    <Card className={`${containerClassName}`}>
      <CardContent className="p-0">
        {/* Schema Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">
                {title}
                {databaseType && (
                  <Badge 
                    className={`ml-2 ${databaseType === "source" ? "bg-blue-500" : "bg-green-500"}`}
                    variant="secondary"
                  >
                    {databaseType === "source" ? "Source" : "Destination"}
                  </Badge>
                )}
              </h3>
              {databaseName && (
                <p className="text-sm text-muted-foreground mt-1">{databaseName}</p>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {schema.tables.length} tables ・ {schema.relations.length} relationships
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Filter tables..."
              className="w-full px-3 py-1.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-background"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>

        {/* Tables List */}
        <ScrollArea className="h-[500px]">
          <div className="p-2">
            {sortedTables.map((table) => {
              const { incomingRelations, outgoingRelations } = getTableRelations(table.name);
              const isExpanded = !!expandedTables[table.name];
              
              return (
                <Collapsible 
                  key={table.name} 
                  open={isExpanded} 
                  onOpenChange={() => toggleTableExpanded(table.name)}
                  className="mb-2"
                >
                  <div className="border rounded-md overflow-hidden">
                    {/* Table Header */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                          )}
                          <div className="font-medium">{table.name}</div>
                          {table.has_data && table.row_count !== undefined && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {table.row_count.toLocaleString()} rows
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {table.size_kb && (
                            <span className="mr-3">
                              <FileSizeDisplay bytes={table.size_kb * 1024} />
                            </span>
                          )}
                          <span>
                            {table.columns.length} columns
                          </span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    {/* Table Details */}
                    <CollapsibleContent>
                      <div className="border-t">
                        {/* Table description */}
                        {table.description && (
                          <div className="px-4 py-2 bg-muted/30 text-sm">
                            {table.description}
                          </div>
                        )}
                        
                        {/* Relationships */}
                        {(incomingRelations.length > 0 || outgoingRelations.length > 0) && (
                          <div className="px-4 py-2 border-t">
                            <div className="flex flex-wrap gap-2 text-xs">
                              {outgoingRelations.map((rel, idx) => (
                                <Badge key={`out-${idx}`} variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400">
                                  <span>
                                    <ExternalLink className="h-3 w-3 inline mr-1" />
                                    {rel.source_column} → {rel.target_table}.{rel.target_column}
                                  </span>
                                </Badge>
                              ))}
                              
                              {incomingRelations.map((rel, idx) => (
                                <Badge key={`in-${idx}`} variant="outline" className="bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400">
                                  <span>
                                    <ExternalLink className="h-3 w-3 inline mr-1" />
                                    {rel.source_table}.{rel.source_column} → {rel.target_column}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Columns */}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[30%]">Column</TableHead>
                              <TableHead className="w-[20%]">Type</TableHead>
                              <TableHead className="w-[10%]">PK/FK</TableHead>
                              <TableHead className="w-[10%]">Nullable</TableHead>
                              <TableHead className="w-[30%]">Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {table.columns.map((column) => (
                              <TableRow key={column.name}>
                                <TableCell className="font-mono text-xs">
                                  {column.name}
                                  {column.is_indexed && !column.is_primary_key && (
                                    <span className="ml-1 text-blue-500" title="Indexed">
                                      IDX
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">  
                                  {column.data_type}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {column.is_primary_key && (
                                      <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 h-5 w-5 p-0 flex items-center justify-center" title="Primary Key">
                                        <Key className="h-3 w-3" />
                                      </Badge>
                                    )}
                                    {column.is_foreign_key && (
                                      <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 h-5 w-5 p-0 flex items-center justify-center" title="Foreign Key">
                                        <ExternalLink className="h-3 w-3" />
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {column.is_nullable ? (
                                    <span className="text-muted-foreground">NULL</span>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 h-5 w-5 p-0 flex items-center justify-center" title="Not Nullable">
                                      <Lock className="h-3 w-3" />
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {column.description || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SchemaVisualizer;