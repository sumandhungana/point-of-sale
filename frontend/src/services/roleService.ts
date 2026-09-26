// Service for role-related API calls
import {apiService} from "@/infrastructure/utils/ApiService";

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;

  error?: string;
}

export interface RoleResponse{
  id:number;
  name:string;
}

export async function getRoles(): Promise<RoleResponse[]> {
  const res = await apiService.get<RestResponse<RoleResponse[]>>(
      'api/v1/role/list',
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    throw new Error(res.error || 'Failed to fetch roles');
  }

  const rawList: any[] = res?.response?.data || [];

  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map((role) => ({
    id: role.id ?? role.roleId ?? role.role_id,
    name: role.name,
  }));
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRoles() {
  const response = await fetch('/api/Role', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
}

export async function createRole(formData: any) {
  const response = await fetch('/api/Role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(formData),
  });
  if (response.status === 200 || response.status === 201) {
    return response.json();
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create role');
  }
} 