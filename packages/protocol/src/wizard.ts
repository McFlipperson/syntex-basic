import type { RequestFrame, ResponseFrame } from "./frames.js";

export type WizardStepType =
  | "note"
  | "select"
  | "text"
  | "confirm"
  | "multiselect"
  | "progress"
  | "action";

export interface WizardStepOption {
  value: string;
  label: string;
  description?: string;
}

export interface WizardStep {
  id: string;
  type: WizardStepType;
  title?: string;
  message?: string;
  options?: WizardStepOption[];
  initialValue?: unknown;
  placeholder?: string;
  sensitive?: boolean;
  executor?: "gateway" | "client";
}

export type WizardRunStatus = "running" | "done" | "cancelled" | "error";

export interface WizardResult {
  done: boolean;
  step?: WizardStep;
  status?: WizardRunStatus;
  error?: string;
}

export interface WizardStartParams {
  flow?: string;
}

export interface WizardNextParams {
  answer?: unknown;
}

export type WizardStartRequest = RequestFrame<"wizard.start", WizardStartParams>;
export type WizardNextRequest = RequestFrame<"wizard.next", WizardNextParams>;
export type WizardStatusRequest = RequestFrame<"wizard.status", Record<string, never>>;
export type WizardCancelRequest = RequestFrame<"wizard.cancel", Record<string, never>>;

export type WizardResponse = ResponseFrame<WizardResult>;
