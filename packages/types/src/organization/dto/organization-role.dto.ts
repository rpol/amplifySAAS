export type OrganizationPermissionMatrix = Record<string, string[]>;

export interface OrganizationRoleDto {
  id: string;
  organizationId: string;
  role: string;
  permission: OrganizationPermissionMatrix;
  createdAt: string;
  updatedAt: string;
}
