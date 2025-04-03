import {
  ApplicationBulkSelectionRequest,
  ApplicationDetailsRequest,
  ApplicationListRequest,
  CancelMigrationJobData,
  CheckHealthData,
  ClearSelectedApplicationsData,
  ConnectionProfileRequest,
  ConnectionTestRequest,
  CreateConnectionProfileData,
  DeleteConnectionProfileData,
  GetApplicationDetailsData,
  GetConnectionCapabilitiesData,
  GetConnectionProfileData,
  GetDatabaseSchemaData,
  GetMigrationLogsData,
  GetMigrationStatusData,
  GetSelectedApplicationsData,
  ListApplicationsData,
  ListConnectionProfilesData,
  ListMigrationJobsData,
  MigrationJobRequest,
  MigrationLogsRequest,
  PingServerData,
  SchemaRequest,
  SelectApplicationsData,
  StartMigrationJobData,
  TestConnectionData,
  UpdateConnectionProfileData,
  ValidateConnectionData,
  ValidateConnectionRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Test a database connection
   * @tags dbtn/module:database_connection
   * @name test_connection
   * @summary Test Connection
   * @request POST:/routes/test
   */
  export namespace test_connection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ConnectionTestRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TestConnectionData;
  }

  /**
   * @description List all saved connection profiles
   * @tags dbtn/module:database_connection
   * @name list_connection_profiles
   * @summary List Connection Profiles
   * @request GET:/routes/profiles
   */
  export namespace list_connection_profiles {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListConnectionProfilesData;
  }

  /**
   * @description Create a new connection profile
   * @tags dbtn/module:database_connection
   * @name create_connection_profile
   * @summary Create Connection Profile
   * @request POST:/routes/profiles
   */
  export namespace create_connection_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ConnectionProfileRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateConnectionProfileData;
  }

  /**
   * @description Update an existing connection profile
   * @tags dbtn/module:database_connection
   * @name update_connection_profile
   * @summary Update Connection Profile
   * @request PUT:/routes/profiles/{profile_id}
   */
  export namespace update_connection_profile {
    export type RequestParams = {
      /** Profile Id */
      profileId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = ConnectionProfileRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateConnectionProfileData;
  }

  /**
   * @description Delete a connection profile
   * @tags dbtn/module:database_connection
   * @name delete_connection_profile
   * @summary Delete Connection Profile
   * @request DELETE:/routes/profiles/{profile_id}
   */
  export namespace delete_connection_profile {
    export type RequestParams = {
      /** Profile Id */
      profileId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteConnectionProfileData;
  }

  /**
   * @description Get a specific connection profile
   * @tags dbtn/module:database_connection
   * @name get_connection_profile
   * @summary Get Connection Profile
   * @request GET:/routes/profiles/{profile_id}
   */
  export namespace get_connection_profile {
    export type RequestParams = {
      /** Profile Id */
      profileId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetConnectionProfileData;
  }

  /**
   * @description Validate a database connection with detailed diagnostics
   * @tags dbtn/module:connection_validation
   * @name validate_connection
   * @summary Validate Connection
   * @request POST:/routes/validate
   */
  export namespace validate_connection {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ValidateConnectionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ValidateConnectionData;
  }

  /**
   * @description Get information about available connection capabilities
   * @tags dbtn/module:connection_validation
   * @name get_connection_capabilities
   * @summary Get Connection Capabilities
   * @request GET:/routes/connection-capabilities
   */
  export namespace get_connection_capabilities {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetConnectionCapabilitiesData;
  }

  /**
   * @description Quick ping test to check if server is reachable
   * @tags dbtn/module:connection_validation
   * @name ping_server
   * @summary Ping Server
   * @request POST:/routes/ping
   */
  export namespace ping_server {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ValidateConnectionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = PingServerData;
  }

  /**
   * @description List applications from the source database
   * @tags dbtn/module:application_selector
   * @name list_applications
   * @summary List Applications
   * @request POST:/routes/list
   */
  export namespace list_applications {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ApplicationListRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ListApplicationsData;
  }

  /**
   * @description Get detailed information about a specific application
   * @tags dbtn/module:application_selector
   * @name get_application_details
   * @summary Get Application Details
   * @request POST:/routes/details
   */
  export namespace get_application_details {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ApplicationDetailsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetApplicationDetailsData;
  }

  /**
   * @description Select applications for migration
   * @tags dbtn/module:application_selector
   * @name select_applications
   * @summary Select Applications
   * @request POST:/routes/select
   */
  export namespace select_applications {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ApplicationBulkSelectionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SelectApplicationsData;
  }

  /**
   * @description Get applications that have been selected for migration for a specific connection profile
   * @tags dbtn/module:application_selector
   * @name get_selected_applications
   * @summary Get Selected Applications
   * @request GET:/routes/selected/{connection_profile_id}
   */
  export namespace get_selected_applications {
    export type RequestParams = {
      /** Connection Profile Id */
      connectionProfileId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSelectedApplicationsData;
  }

  /**
   * @description Clear all selected applications for a specific connection profile
   * @tags dbtn/module:application_selector
   * @name clear_selected_applications
   * @summary Clear Selected Applications
   * @request DELETE:/routes/selected/{connection_profile_id}
   */
  export namespace clear_selected_applications {
    export type RequestParams = {
      /** Connection Profile Id */
      connectionProfileId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ClearSelectedApplicationsData;
  }

  /**
   * @description Get the database schema for a given connection profile
   * @tags dbtn/module:schema
   * @name get_database_schema
   * @summary Get Database Schema
   * @request POST:/routes/schema/get-database-schema
   */
  export namespace get_database_schema {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SchemaRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetDatabaseSchemaData;
  }

  /**
   * @description Start a new migration job
   * @tags dbtn/module:migration
   * @name start_migration_job
   * @summary Start Migration Job
   * @request POST:/routes/migration/start
   */
  export namespace start_migration_job {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MigrationJobRequest;
    export type RequestHeaders = {};
    export type ResponseBody = StartMigrationJobData;
  }

  /**
   * @description Get the status of a migration job
   * @tags dbtn/module:migration
   * @name get_migration_status
   * @summary Get Migration Status
   * @request GET:/routes/migration/status/{job_id}
   */
  export namespace get_migration_status {
    export type RequestParams = {
      /** Job Id */
      jobId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMigrationStatusData;
  }

  /**
   * @description Get logs for a migration job
   * @tags dbtn/module:migration
   * @name get_migration_logs
   * @summary Get Migration Logs
   * @request POST:/routes/migration/logs
   */
  export namespace get_migration_logs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MigrationLogsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetMigrationLogsData;
  }

  /**
   * @description List all migration jobs
   * @tags dbtn/module:migration
   * @name list_migration_jobs
   * @summary List Migration Jobs
   * @request GET:/routes/migration/list
   */
  export namespace list_migration_jobs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListMigrationJobsData;
  }

  /**
   * @description Cancel a running migration job
   * @tags dbtn/module:migration
   * @name cancel_migration_job
   * @summary Cancel Migration Job
   * @request POST:/routes/migration/cancel/{job_id}
   */
  export namespace cancel_migration_job {
    export type RequestParams = {
      /** Job Id */
      jobId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CancelMigrationJobData;
  }
}
