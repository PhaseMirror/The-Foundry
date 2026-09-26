const API_BASE = '/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public timestamp: string
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = localStorage.getItem('agency_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = (body as any).error || detail;
    } catch {
      // keep default detail
    }
    throw new ApiError(response.status, detail, new Date().toISOString());
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: {
    check: () => request<{ status: string }>('/health'),
  },
  auth: {
    login: (credentials: { username: string; password: string }) =>
      request<import('../types').LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  },
  agents: {
    list: () => request<import('../types').Agent[]>('/agency/agents'),
  },
  projects: {
    list: () => request<import('../types').Project[]>('/agency/projects'),
    create: (data: { name: string; description?: string }) =>
      request<import('../types').Project>('/agency/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  adrs: {
    list: () => request<import('../types').ADR[]>('/agency/adrs'),
  },
  dissonance: {
    graph: () => request<import('../types').DissonanceGraph>('/agency/dissonance/graph'),
  },
  archivum: {
    ledger: () => request<import('../types').ArchivumEntry[]>('/agency/archivum/ledger'),
    register: (metadata: Record<string, unknown>) =>
      request<import('../types').ArchivumEntry>('/agency/archivum/register', {
        method: 'POST',
        body: JSON.stringify(metadata),
      }),
  },
  tripleLock: {
    dispatch: (mission: { payload: string; type?: string; partition?: string }) =>
      request<import('../types').TripleLockResult>('/agency/coding-commander/completions', {
        method: 'POST',
        body: JSON.stringify(mission),
      }),
  },
  examiner: {
    audit: (observed_l_eff?: number) =>
      request<import('../types').AuditResult>('/agency/the-examiner/audit', {
        method: 'POST',
        body: JSON.stringify({ observed_l_eff }),
      }),
  },
  publisher: {
    publish: (file_path: string) =>
      request<import('../types').PublishResult>('/agency/the-publisher/publish', {
        method: 'POST',
        body: JSON.stringify({ file_path }),
      }),
  },
  metrics: {
    daemon: () => request<import('../types').DaemonMetrics>('/agency/daemon/metrics'),
  },
  cli: {
    execute: (command: string) =>
      request<{ output: string; exitCode: number }>('/agency/cli/execute', {
        method: 'POST',
        body: JSON.stringify({ command }),
      }),
  },
  alp: {
    evaluate: (params: { id: string; payload?: Record<string, unknown>; mutating?: boolean; server_binding?: string }) =>
      request<{ risk: string; allowed?: boolean; action_id: string; evaluated_by: string; tier: string }>('/alp/evaluate', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  },
};

export { ApiError };
