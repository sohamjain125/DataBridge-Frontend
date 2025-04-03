/** ApplicationBulkSelectionRequest */
export interface ApplicationBulkSelectionRequest {
  /** Connection Profile Id */
  connection_profile_id: string;
  /** Application Ids */
  application_ids: string[];
  /**
   * Select All
   * @default false
   */
  select_all?: boolean;
  /** Filters */
  filters?: Record<string, any> | null;
}

/** ApplicationDetails */
export interface ApplicationDetails {
  /** Application Id */
  application_id: string;
  /** Application Name */
  application_name: string;
  /** Description */
  description?: string | null;
  /** Version */
  version?: string | null;
  /** Creation Date */
  creation_date?: string | null;
  /** Last Modified Date */
  last_modified_date?: string | null;
  /** Status */
  status?: string | null;
  /** Size */
  size?: number | null;
  /** Owner */
  owner?: string | null;
  /** Environment */
  environment?: string | null;
  /**
   * Is Critical
   * @default false
   */
  is_critical?: boolean;
  /** Additional Metadata */
  additional_metadata?: Record<string, any> | null;
}

/** ApplicationDetailsRequest */
export interface ApplicationDetailsRequest {
  /** Connection Profile Id */
  connection_profile_id: string;
  /** Application Id */
  application_id: string;
}

/** ApplicationDetailsResponse */
export interface ApplicationDetailsResponse {
  application: ApplicationDetails;
  /** Database Objects */
  database_objects?: Record<string, any> | null;
  /** Dependencies */
  dependencies?: string[] | null;
}

/** ApplicationListRequest */
export interface ApplicationListRequest {
  /** Connection Profile Id */
  connection_profile_id: string;
  /**
   * Page
   * @default 1
   */
  page?: number;
  /**
   * Page Size
   * @default 50
   */
  page_size?: number;
  /** Search Term */
  search_term?: string | null;
  /**
   * Sort By
   * @default "application_name"
   */
  sort_by?: string;
  /** @default "asc" */
  sort_order?: SortOrder;
}

/** ApplicationListResponse */
export interface ApplicationListResponse {
  /** Applications */
  applications: ApplicationDetails[];
  /** Total Count */
  total_count: number;
  /** Page */
  page: number;
  /** Page Size */
  page_size: number;
  /** Total Pages */
  total_pages: number;
}

/** ApplicationSelectionResponse */
export interface ApplicationSelectionResponse {
  /** Selected Count */
  selected_count: number;
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** ConnectionCapabilities */
export interface ConnectionCapabilities {
  /**
   * Supports Windows Auth
   * @default false
   */
  supports_windows_auth?: boolean;
  /**
   * Supports Sql Auth
   * @default true
   */
  supports_sql_auth?: boolean;
  /**
   * Available Drivers
   * @default []
   */
  available_drivers?: string[];
  /** Preferred Driver */
  preferred_driver?: string | null;
}

/** ConnectionProfile */
export interface ConnectionProfile {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Server */
  server: string;
  /** Database */
  database: string;
  /** Auth Type */
  auth_type: string;
  /** Username */
  username?: string | null;
  /** Password */
  password?: string | null;
  /** Port */
  port?: number | null;
  /**
   * Trust Certificate
   * @default false
   */
  trust_certificate?: boolean;
  /** Type */
  type: string;
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at: string;
}

/** ConnectionProfileRequest */
export interface ConnectionProfileRequest {
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Server */
  server: string;
  /** Database */
  database: string;
  /** Auth Type */
  auth_type: string;
  /** Username */
  username?: string | null;
  /** Password */
  password?: string | null;
  /** Port */
  port?: number | null;
  /**
   * Trust Certificate
   * @default false
   */
  trust_certificate?: boolean;
  /** Type */
  type: string;
}

/** ConnectionProfileResponse */
export interface ConnectionProfileResponse {
  profile: ConnectionProfile;
}

/** ConnectionProfilesResponse */
export interface ConnectionProfilesResponse {
  /** Profiles */
  profiles: ConnectionProfile[];
}

/** ConnectionTestRequest */
export interface ConnectionTestRequest {
  /** Server */
  server: string;
  /** Database */
  database: string;
  /** Auth Type */
  auth_type: string;
  /** Username */
  username?: string | null;
  /** Password */
  password?: string | null;
  /** Port */
  port?: number | null;
  /**
   * Trust Certificate
   * @default false
   */
  trust_certificate?: boolean;
}

/** ConnectionTestResponse */
export interface ConnectionTestResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** DatabaseSchema */
export interface DatabaseSchema {
  /** Tables */
  tables: TableSchema[];
  /**
   * Relations
   * @default []
   */
  relations?: Record<string, any>[];
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** MigrationJobListResponse */
export interface MigrationJobListResponse {
  /** Jobs */
  jobs: MigrationJobStatus[];
  /** Total Count */
  total_count: number;
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Message */
  message?: string | null;
}

/** MigrationJobRequest */
export interface MigrationJobRequest {
  /** Source Connection Id */
  source_connection_id: string;
  /** Destination Connection Id */
  destination_connection_id: string;
  /** Application Ids */
  application_ids: string[];
  /** Table Mappings */
  table_mappings: MigrationTableMapping[];
  /**
   * Run Validations
   * @default true
   */
  run_validations?: boolean;
  /**
   * Batch Size
   * @default 1000
   */
  batch_size?: number;
  /**
   * Timeout Seconds
   * @default 3600
   */
  timeout_seconds?: number;
  /** Description */
  description?: string | null;
}

/** MigrationJobResponse */
export interface MigrationJobResponse {
  /** Job Id */
  job_id: string;
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** MigrationJobStatus */
export interface MigrationJobStatus {
  /** Job Id */
  job_id: string;
  /** Source Connection Id */
  source_connection_id: string;
  /** Destination Connection Id */
  destination_connection_id: string;
  /** Application Ids */
  application_ids: string[];
  /** Status */
  status: string;
  /**
   * Progress Percentage
   * @default 0
   */
  progress_percentage?: number;
  /** Start Time */
  start_time?: string | null;
  /** End Time */
  end_time?: string | null;
  /** Estimated Completion Time */
  estimated_completion_time?: string | null;
  /**
   * Table Statuses
   * @default []
   */
  table_statuses?: MigrationTableStatus[];
  /** Error Message */
  error_message?: string | null;
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at: string;
}

/** MigrationJobStatusResponse */
export interface MigrationJobStatusResponse {
  job_status: MigrationJobStatus;
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Message */
  message?: string | null;
}

/** MigrationLog */
export interface MigrationLog {
  /** Timestamp */
  timestamp: string;
  /** Level */
  level: string;
  /** Message */
  message: string;
  /** Details */
  details?: Record<string, any> | null;
}

/** MigrationLogsRequest */
export interface MigrationLogsRequest {
  /** Job Id */
  job_id: string;
  /**
   * Limit
   * @default 100
   */
  limit?: number;
  /**
   * Offset
   * @default 0
   */
  offset?: number;
  /** Level */
  level?: string | null;
  /** From Timestamp */
  from_timestamp?: string | null;
  /** To Timestamp */
  to_timestamp?: string | null;
}

/** MigrationLogsResponse */
export interface MigrationLogsResponse {
  /** Job Id */
  job_id: string;
  /** Logs */
  logs: MigrationLog[];
  /** Total Count */
  total_count: number;
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Message */
  message?: string | null;
}

/** MigrationTableMapping */
export interface MigrationTableMapping {
  /** Source Table */
  source_table: string;
  /** Source Columns */
  source_columns: string[];
  /** Destination Table */
  destination_table: string;
  /** Destination Columns */
  destination_columns: string[];
  /** Transformation Rules */
  transformation_rules?: Record<string, string> | null;
}

/** MigrationTableStatus */
export interface MigrationTableStatus {
  /** Table Name */
  table_name: string;
  /**
   * Records Total
   * @default 0
   */
  records_total?: number;
  /**
   * Records Processed
   * @default 0
   */
  records_processed?: number;
  /**
   * Records Succeeded
   * @default 0
   */
  records_succeeded?: number;
  /**
   * Records Failed
   * @default 0
   */
  records_failed?: number;
  /** Start Time */
  start_time?: string | null;
  /** End Time */
  end_time?: string | null;
  /**
   * Status
   * @default "PENDING"
   */
  status?: string;
  /** Error Message */
  error_message?: string | null;
}

/** SchemaRequest */
export interface SchemaRequest {
  /** Connection Profile Id */
  connection_profile_id: string;
}

/** SchemaResponse */
export interface SchemaResponse {
  schema?: DatabaseSchema;
  /**
   * Success
   * @default true
   */
  success?: boolean;
  /** Message */
  message?: string | null;
}

/** SortOrder */
export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

/** TableColumn */
export interface TableColumn {
  /** Name */
  name: string;
  /** Data Type */
  data_type: string;
  /**
   * Is Primary Key
   * @default false
   */
  is_primary_key?: boolean;
  /**
   * Is Foreign Key
   * @default false
   */
  is_foreign_key?: boolean;
  /**
   * Is Nullable
   * @default true
   */
  is_nullable?: boolean;
  /**
   * Is Indexed
   * @default false
   */
  is_indexed?: boolean;
  /** Foreign Key Table */
  foreign_key_table?: string | null;
  /** Foreign Key Column */
  foreign_key_column?: string | null;
  /** Description */
  description?: string | null;
}

/** TableSchema */
export interface TableSchema {
  /** Name */
  name: string;
  /** Columns */
  columns: TableColumn[];
  /** Row Count */
  row_count?: number | null;
  /** Size Kb */
  size_kb?: number | null;
  /**
   * Has Data
   * @default false
   */
  has_data?: boolean;
  /** Description */
  description?: string | null;
}

/** ValidateConnectionRequest */
export interface ValidateConnectionRequest {
  /** Server */
  server: string;
  /** Database */
  database: string;
  /** Auth Type */
  auth_type: string;
  /** Username */
  username?: string | null;
  /** Password */
  password?: string | null;
  /** Port */
  port?: number | null;
  /**
   * Trust Certificate
   * @default false
   */
  trust_certificate?: boolean;
  /**
   * Timeout
   * @default 30
   */
  timeout?: number | null;
  /** Test Query */
  test_query?: string | null;
}

/** ValidateConnectionResponse */
export interface ValidateConnectionResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Error Type */
  error_type?: string | null;
  /** Details */
  details?: Record<string, any> | null;
  /** Server Info */
  server_info?: Record<string, string> | null;
  /** Connection Time Ms */
  connection_time_ms?: number | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type TestConnectionData = ConnectionTestResponse;

export type TestConnectionError = HTTPValidationError;

export type ListConnectionProfilesData = ConnectionProfilesResponse;

export type CreateConnectionProfileData = ConnectionProfileResponse;

export type CreateConnectionProfileError = HTTPValidationError;

export interface UpdateConnectionProfileParams {
  /** Profile Id */
  profileId: string;
}

export type UpdateConnectionProfileData = ConnectionProfileResponse;

export type UpdateConnectionProfileError = HTTPValidationError;

export interface DeleteConnectionProfileParams {
  /** Profile Id */
  profileId: string;
}

/** Response Delete Connection Profile */
export type DeleteConnectionProfileData = Record<string, any>;

export type DeleteConnectionProfileError = HTTPValidationError;

export interface GetConnectionProfileParams {
  /** Profile Id */
  profileId: string;
}

export type GetConnectionProfileData = ConnectionProfileResponse;

export type GetConnectionProfileError = HTTPValidationError;

export type ValidateConnectionData = ValidateConnectionResponse;

export type ValidateConnectionError = HTTPValidationError;

export type GetConnectionCapabilitiesData = ConnectionCapabilities;

export type PingServerData = ValidateConnectionResponse;

export type PingServerError = HTTPValidationError;

export type ListApplicationsData = ApplicationListResponse;

export type ListApplicationsError = HTTPValidationError;

export type GetApplicationDetailsData = ApplicationDetailsResponse;

export type GetApplicationDetailsError = HTTPValidationError;

export type SelectApplicationsData = ApplicationSelectionResponse;

export type SelectApplicationsError = HTTPValidationError;

export interface GetSelectedApplicationsParams {
  /** Connection Profile Id */
  connectionProfileId: string;
}

/** Response Get Selected Applications */
export type GetSelectedApplicationsData = Record<string, any>;

export type GetSelectedApplicationsError = HTTPValidationError;

export interface ClearSelectedApplicationsParams {
  /** Connection Profile Id */
  connectionProfileId: string;
}

/** Response Clear Selected Applications */
export type ClearSelectedApplicationsData = Record<string, any>;

export type ClearSelectedApplicationsError = HTTPValidationError;

export type GetDatabaseSchemaData = SchemaResponse;

export type GetDatabaseSchemaError = HTTPValidationError;

export type StartMigrationJobData = MigrationJobResponse;

export type StartMigrationJobError = HTTPValidationError;

export interface GetMigrationStatusParams {
  /** Job Id */
  jobId: string;
}

export type GetMigrationStatusData = MigrationJobStatusResponse;

export type GetMigrationStatusError = HTTPValidationError;

export type GetMigrationLogsData = MigrationLogsResponse;

export type GetMigrationLogsError = HTTPValidationError;

export type ListMigrationJobsData = MigrationJobListResponse;

export interface CancelMigrationJobParams {
  /** Job Id */
  jobId: string;
}

export type CancelMigrationJobData = MigrationJobResponse;

export type CancelMigrationJobError = HTTPValidationError;
