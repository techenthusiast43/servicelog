export enum ServiceStatus {
  None = 0,
  Pending = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface ServiceRecord {
  serviceId: string;
  provider: `0x${string}`;
  customer: `0x${string}`;
  status: ServiceStatus;
  createdAt: number;
  completedAt: number;
  title: string;
  description: string;
}

export interface ServiceStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
}

