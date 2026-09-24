/** Response models, mirroring the FastAPI schemas in backend/Schemas.py. */

export interface WorkflowResponse {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface CronJobResponse {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface ExecutionResult {
  [key: string]: unknown;
}

export interface ExecutionLogResponse {
  id: number;
  job_id?: number;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export interface HealthResponse {
  status: string;
  scheduler_running: boolean;
}
