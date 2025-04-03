import React from "react";

// Types for migration process

// Table mapping definition for migration
export interface MigrationTableMapping {
  source_table: string;
  source_columns: string[];
  destination_table: string;
  destination_columns: string[];
  transformation_rules?: Record<string, string>;
}

// Migration job request payload
export interface MigrationJobRequest {
  source_connection_id: string;
  destination_connection_id: string;
  application_ids: string[];
  table_mappings: MigrationTableMapping[];
  run_validations?: boolean;
  batch_size?: number;
  timeout_seconds?: number;
  description?: string;
}

// Migration status enum
export enum MigrationStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  VALIDATING = "VALIDATING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  PAUSED = "PAUSED",
}

// Log level enum
export enum MigrationLogLevel {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

// Migration log entry
export interface MigrationLog {
  timestamp: string;
  level: string;
  message: string;
  details?: Record<string, any>;
}

// Status of a single table in a migration
export interface MigrationTableStatus {
  table_name: string;
  records_total: number;
  records_processed: number;
  records_succeeded: number;
  records_failed: number;
  start_time?: string;
  end_time?: string;
  status: string;
  error_message?: string;
}

// Status of an entire migration job
export interface MigrationJobStatus {
  job_id: string;
  source_connection_id: string;
  destination_connection_id: string;
  application_ids: string[];
  status: string;
  progress_percentage: number;
  start_time?: string;
  end_time?: string;
  estimated_completion_time?: string;
  table_statuses: MigrationTableStatus[];
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Response when starting a migration
export interface MigrationJobResponse {
  job_id: string;
  status: string;
  message: string;
}

// Response when getting job status
export interface MigrationJobStatusResponse {
  job_status: MigrationJobStatus;
  success: boolean;
  message?: string;
}

// Request to get migration logs
export interface MigrationLogsRequest {
  job_id: string;
  limit?: number;
  offset?: number;
  level?: string;
  from_timestamp?: string;
  to_timestamp?: string;
}

// Response with migration logs
export interface MigrationLogsResponse {
  job_id: string;
  logs: MigrationLog[];
  total_count: number;
  success: boolean;
  message?: string;
}

// Response when listing all migration jobs
export interface MigrationJobListResponse {
  jobs: MigrationJobStatus[];
  total_count: number;
  success: boolean;
  message?: string;
}