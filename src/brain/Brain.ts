import {
  ApplicationBulkSelectionRequest,
  ApplicationDetailsRequest,
  ApplicationListRequest,
  CancelMigrationJobData,
  CancelMigrationJobError,
  CancelMigrationJobParams,
  CheckHealthData,
  ClearSelectedApplicationsData,
  ClearSelectedApplicationsError,
  ClearSelectedApplicationsParams,
  ConnectionProfileRequest,
  ConnectionTestRequest,
  CreateConnectionProfileData,
  CreateConnectionProfileError,
  DeleteConnectionProfileData,
  DeleteConnectionProfileError,
  DeleteConnectionProfileParams,
  GetApplicationDetailsData,
  GetApplicationDetailsError,
  GetConnectionCapabilitiesData,
  GetConnectionProfileData,
  GetConnectionProfileError,
  GetConnectionProfileParams,
  GetDatabaseSchemaData,
  GetDatabaseSchemaError,
  GetMigrationLogsData,
  GetMigrationLogsError,
  GetMigrationStatusData,
  GetMigrationStatusError,
  GetMigrationStatusParams,
  GetSelectedApplicationsData,
  GetSelectedApplicationsError,
  GetSelectedApplicationsParams,
  ListApplicationsData,
  ListApplicationsError,
  ListConnectionProfilesData,
  ListMigrationJobsData,
  MigrationJobRequest,
  MigrationLogsRequest,
  PingServerData,
  PingServerError,
  SchemaRequest,
  SelectApplicationsData,
  SelectApplicationsError,
  StartMigrationJobData,
  StartMigrationJobError,
  TestConnectionData,
  TestConnectionError,
  UpdateConnectionProfileData,
  UpdateConnectionProfileError,
  UpdateConnectionProfileParams,
  ValidateConnectionData,
  ValidateConnectionError,
  ValidateConnectionRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Test a database connection
   *
   * @tags dbtn/module:database_connection
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/test
   */
  test_connection = (data: ConnectionTestRequest, params: RequestParams = {}) =>
    this.request<TestConnectionData, TestConnectionError>({
      path: `/routes/test`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all saved connection profiles
   *
   * @tags dbtn/module:database_connection
   * @name list_connection_profiles
   * @summary List Connection Profiles
   * @request GET:/routes/profiles
   */
  list_connection_profiles = (params: RequestParams = {}) =>
    this.request<ListConnectionProfilesData, any>({
      path: `/routes/profiles`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new connection profile
   *
   * @tags dbtn/module:database_connection
   * @name create_connection_profile
   * @summary Create Connection Profile
   * @request POST:/routes/profiles
   */
  create_connection_profile = (data: ConnectionProfileRequest, params: RequestParams = {}) =>
    this.request<CreateConnectionProfileData, CreateConnectionProfileError>({
      path: `/routes/profiles`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update an existing connection profile
   *
   * @tags dbtn/module:database_connection
   * @name update_connection_profile
   * @summary Update Connection Profile
   * @request PUT:/routes/profiles/{profile_id}
   */
  update_connection_profile = (
    { profileId, ...query }: UpdateConnectionProfileParams,
    data: ConnectionProfileRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateConnectionProfileData, UpdateConnectionProfileError>({
      path: `/routes/profiles/${profileId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a connection profile
   *
   * @tags dbtn/module:database_connection
   * @name delete_connection_profile
   * @summary Delete Connection Profile
   * @request DELETE:/routes/profiles/{profile_id}
   */
  delete_connection_profile = ({ profileId, ...query }: DeleteConnectionProfileParams, params: RequestParams = {}) =>
    this.request<DeleteConnectionProfileData, DeleteConnectionProfileError>({
      path: `/routes/profiles/${profileId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get a specific connection profile
   *
   * @tags dbtn/module:database_connection
   * @name get_connection_profile
   * @summary Get Connection Profile
   * @request GET:/routes/profiles/{profile_id}
   */
  get_connection_profile = ({ profileId, ...query }: GetConnectionProfileParams, params: RequestParams = {}) =>
    this.request<GetConnectionProfileData, GetConnectionProfileError>({
      path: `/routes/profiles/${profileId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Validate a database connection with detailed diagnostics
   *
   * @tags dbtn/module:connection_validation
   * @name validate_connection
   * @summary Validate Connection
   * @request POST:/routes/validate
   */
  validate_connection = (data: ValidateConnectionRequest, params: RequestParams = {}) =>
    this.request<ValidateConnectionData, ValidateConnectionError>({
      path: `/routes/validate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get information about available connection capabilities
   *
   * @tags dbtn/module:connection_validation
   * @name get_connection_capabilities
   * @summary Get Connection Capabilities
   * @request GET:/routes/connection-capabilities
   */
  get_connection_capabilities = (params: RequestParams = {}) =>
    this.request<GetConnectionCapabilitiesData, any>({
      path: `/routes/connection-capabilities`,
      method: "GET",
      ...params,
    });

  /**
   * @description Quick ping test to check if server is reachable
   *
   * @tags dbtn/module:connection_validation
   * @name ping_server
   * @summary Ping Server
   * @request POST:/routes/ping
   */
  ping_server = (data: ValidateConnectionRequest, params: RequestParams = {}) =>
    this.request<PingServerData, PingServerError>({
      path: `/routes/ping`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List applications from the source database
   *
   * @tags dbtn/module:application_selector
   * @name list_applications
   * @summary List Applications
   * @request POST:/routes/list
   */
  list_applications = (data: ApplicationListRequest, params: RequestParams = {}) =>
    this.request<ListApplicationsData, ListApplicationsError>({
      path: `/routes/list`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get detailed information about a specific application
   *
   * @tags dbtn/module:application_selector
   * @name get_application_details
   * @summary Get Application Details
   * @request POST:/routes/details
   */
  get_application_details = (data: ApplicationDetailsRequest, params: RequestParams = {}) =>
    this.request<GetApplicationDetailsData, GetApplicationDetailsError>({
      path: `/routes/details`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Select applications for migration
   *
   * @tags dbtn/module:application_selector
   * @name select_applications
   * @summary Select Applications
   * @request POST:/routes/select
   */
  select_applications = (data: ApplicationBulkSelectionRequest, params: RequestParams = {}) =>
    this.request<SelectApplicationsData, SelectApplicationsError>({
      path: `/routes/select`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get applications that have been selected for migration for a specific connection profile
   *
   * @tags dbtn/module:application_selector
   * @name get_selected_applications
   * @summary Get Selected Applications
   * @request GET:/routes/selected/{connection_profile_id}
   */
  get_selected_applications = (
    { connectionProfileId, ...query }: GetSelectedApplicationsParams,
    params: RequestParams = {},
  ) =>
    this.request<GetSelectedApplicationsData, GetSelectedApplicationsError>({
      path: `/routes/selected/${connectionProfileId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Clear all selected applications for a specific connection profile
   *
   * @tags dbtn/module:application_selector
   * @name clear_selected_applications
   * @summary Clear Selected Applications
   * @request DELETE:/routes/selected/{connection_profile_id}
   */
  clear_selected_applications = (
    { connectionProfileId, ...query }: ClearSelectedApplicationsParams,
    params: RequestParams = {},
  ) =>
    this.request<ClearSelectedApplicationsData, ClearSelectedApplicationsError>({
      path: `/routes/selected/${connectionProfileId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get the database schema for a given connection profile
   *
   * @tags dbtn/module:schema
   * @name get_database_schema
   * @summary Get Database Schema
   * @request POST:/routes/schema/get-database-schema
   */
  get_database_schema = (data: SchemaRequest, params: RequestParams = {}) =>
    this.request<GetDatabaseSchemaData, GetDatabaseSchemaError>({
      path: `/routes/schema/get-database-schema`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Start a new migration job
   *
   * @tags dbtn/module:migration
   * @name start_migration_job
   * @summary Start Migration Job
   * @request POST:/routes/migration/start
   */
  start_migration_job = (data: MigrationJobRequest, params: RequestParams = {}) =>
    this.request<StartMigrationJobData, StartMigrationJobError>({
      path: `/routes/migration/start`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the status of a migration job
   *
   * @tags dbtn/module:migration
   * @name get_migration_status
   * @summary Get Migration Status
   * @request GET:/routes/migration/status/{job_id}
   */
  get_migration_status = ({ jobId, ...query }: GetMigrationStatusParams, params: RequestParams = {}) =>
    this.request<GetMigrationStatusData, GetMigrationStatusError>({
      path: `/routes/migration/status/${jobId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get logs for a migration job
   *
   * @tags dbtn/module:migration
   * @name get_migration_logs
   * @summary Get Migration Logs
   * @request POST:/routes/migration/logs
   */
  get_migration_logs = (data: MigrationLogsRequest, params: RequestParams = {}) =>
    this.request<GetMigrationLogsData, GetMigrationLogsError>({
      path: `/routes/migration/logs`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all migration jobs
   *
   * @tags dbtn/module:migration
   * @name list_migration_jobs
   * @summary List Migration Jobs
   * @request GET:/routes/migration/list
   */
  list_migration_jobs = (params: RequestParams = {}) =>
    this.request<ListMigrationJobsData, any>({
      path: `/routes/migration/list`,
      method: "GET",
      ...params,
    });

  /**
   * @description Cancel a running migration job
   *
   * @tags dbtn/module:migration
   * @name cancel_migration_job
   * @summary Cancel Migration Job
   * @request POST:/routes/migration/cancel/{job_id}
   */
  cancel_migration_job = ({ jobId, ...query }: CancelMigrationJobParams, params: RequestParams = {}) =>
    this.request<CancelMigrationJobData, CancelMigrationJobError>({
      path: `/routes/migration/cancel/${jobId}`,
      method: "POST",
      ...params,
    });
}
