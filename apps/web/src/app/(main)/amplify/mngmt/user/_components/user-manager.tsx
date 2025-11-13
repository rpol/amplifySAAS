"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { ensureClientResponse } from "@/lib/auth-client-helpers";

import { ConfirmDeleteUserDialog } from "./confirm-delete-user-dialog";
import { CreateUserCard } from "./create-user-card";
import { EditUserDialog } from "./edit-user-dialog";
import {
  createUserSchema,
  type CreateUserFormValues,
  safeParseUserData,
  type UpdateUserFormValues,
} from "./user-form";
import { type AdminUser } from "./user-types";

const DEFAULT_LIMIT = 100;

type ListUsersResponse = {
  users: AdminUser[];
  total: number;
  limit?: number;
  offset?: number;
};

type PasswordResponse = {
  status: boolean;
};

type RemoveUserResponse = {
  success: boolean;
};

function parseRoleInput(value?: string | null): string | string[] | undefined {
  if (!value) {
    return undefined;
  }
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return undefined;
  }
  return parts.length === 1 ? parts[0] : parts;
}

function normalizeRoleValue(role?: string | null): string {
  if (!role) {
    return "";
  }
  return role
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(",");
}

function normalizeRoleDisplay(role?: string | null): string {
  const normalized = normalizeRoleValue(role);
  if (!normalized) {
    return "—";
  }
  return normalized.replace(/,/g, ", ");
}

function normalizeRoleInputValue(role: string | string[]): string {
  if (Array.isArray(role)) {
    return role
      .map((part) => part.trim())
      .filter(Boolean)
      .join(",");
  }
  return normalizeRoleValue(role);
}

function formatDate(value?: string | Date | null): string {
  if (!value) {
    return "—";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return format(date, "MMM d, yyyy");
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function isPermissionError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not allowed") ||
    normalized.includes("forbidden") ||
    normalized.includes("unauthorized")
  );
}

export function UserManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<AdminUser | null>(
    null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      data: "",
    },
  });

  const refreshUsers = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);
    setPermissionDenied(false);
    try {
      const response = ensureClientResponse<ListUsersResponse>(
        await authClient.admin.listUsers({
          query: { limit: DEFAULT_LIMIT },
        })
      );
      if (response.error) {
        const message = response.error.message ?? "Unable to load users.";
        if (isPermissionError(message)) {
          setPermissionDenied(true);
        }
        throw new Error(message);
      }
      const result = response.data;
      setUsers(Array.isArray(result?.users) ? result.users : []);
    } catch (error) {
      const message = toErrorMessage(error, "Unable to load users.");
      console.error("Failed to load users", error);
      setUsers([]);
      setLoadError(message);
      if (isPermissionError(message)) {
        setPermissionDenied(true);
        toast.warning("You do not have permission to view users.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const onCreate = (values: CreateUserFormValues) => {
    startSubmitTransition(async () => {
      try {
        const name = values.name.trim();
        const email = values.email.trim();
        const roleInput = parseRoleInput(values.role ?? "");
        let additionalData: Record<string, unknown> | undefined;
        try {
          additionalData = safeParseUserData(values.data);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Additional data must be valid JSON."
          );
          return;
        }
        const response = ensureClientResponse<{ user: AdminUser }>(
          await authClient.admin.createUser({
            name,
            email,
            password: values.password,
            ...(roleInput
              ? {
                  role: roleInput as unknown as
                    | "admin"
                    | "user"
                    | ("admin" | "user")[],
                }
              : {}),
            ...(additionalData ? { data: additionalData } : {}),
          })
        );
        if (response.error) {
          throw new Error(response.error.message ?? "Unable to create user.");
        }
        if (response.data?.user) {
          toast.success(`User "${response.data.user.name}" created.`);
        } else {
          toast.success(`User "${name}" created.`);
        }
        form.reset({
          name: "",
          email: "",
          password: "",
          role: "",
          data: "",
        });
        await refreshUsers();
      } catch (error) {
        console.error("Failed to create user", error);
        toast.error(
          error instanceof Error ? error.message : "Unable to create user."
        );
      }
    });
  };

  const handleEditSubmit = async (id: string, values: UpdateUserFormValues) => {
    try {
      const currentUser = users.find((candidate) => candidate.id === id);
      const updatePayload: Record<string, unknown> = {};
      let updatedName = currentUser?.name ?? values.name.trim();
      const trimmedName = values.name.trim();
      const trimmedEmail = values.email.trim();
      const roleInput = parseRoleInput(values.role ?? "");
      const existingRoleValue = normalizeRoleValue(currentUser?.role);

      if (
        trimmedName.length > 0 &&
        (!currentUser || currentUser.name !== trimmedName)
      ) {
        updatePayload.name = trimmedName;
      }
      if (
        trimmedEmail.length > 0 &&
        (!currentUser || currentUser.email !== trimmedEmail)
      ) {
        updatePayload.email = trimmedEmail;
      }
      if (roleInput) {
        const roleCandidate = normalizeRoleInputValue(roleInput);
        if (roleCandidate && roleCandidate !== existingRoleValue) {
          updatePayload.role = roleInput as unknown as
            | "admin"
            | "user"
            | ("admin" | "user")[];
        }
      }

      let additionalData: Record<string, unknown> | undefined;
      try {
        additionalData = safeParseUserData(values.data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Additional data must be valid JSON."
        );
        return;
      }

      if (additionalData && Object.keys(additionalData).length > 0) {
        Object.assign(updatePayload, additionalData);
      }

      let performedDetailsUpdate = false;
      let performedPasswordUpdate = false;

      if (Object.keys(updatePayload).length > 0) {
        const updateResponse = ensureClientResponse<AdminUser>(
          await authClient.admin.updateUser({
            userId: id,
            data: updatePayload,
          })
        );
        if (updateResponse.error) {
          throw new Error(
            updateResponse.error.message ?? "Unable to update user."
          );
        }
        if (updateResponse.data) {
          updatedName = updateResponse.data.name;
        }
        performedDetailsUpdate = true;
      }

      if (values.password) {
        const passwordResponse = ensureClientResponse<PasswordResponse>(
          await authClient.admin.setUserPassword({
            userId: id,
            newPassword: values.password,
          })
        );
        if (passwordResponse.error) {
          throw new Error(
            passwordResponse.error.message ?? "Unable to update password."
          );
        }
        performedPasswordUpdate = true;
      }

      if (!performedDetailsUpdate && !performedPasswordUpdate) {
        toast.info("No changes detected.");
        return;
      }

      if (performedDetailsUpdate && performedPasswordUpdate) {
        toast.success(`User "${updatedName}" updated and password reset.`);
      } else if (performedPasswordUpdate) {
        toast.success(`Password updated for "${updatedName}".`);
      } else {
        toast.success(`User "${updatedName}" updated.`);
      }

      setEditingUser(null);
      await refreshUsers();
    } catch (error) {
      console.error("Failed to update user", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to update user."
      );
    }
  };

  const handleDelete = async (user: AdminUser) => {
    try {
      const response = ensureClientResponse<RemoveUserResponse>(
        await authClient.admin.removeUser({
          userId: user.id,
        })
      );
      if (response.error) {
        throw new Error(response.error.message ?? "Unable to delete user.");
      }
      if (!response.data?.success) {
        throw new Error("Unable to delete user.");
      }
      toast.success(`User "${user.name}" deleted.`);
      setPendingDeletion(null);
      await refreshUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to delete user."
      );
    }
  };

  const isMutating = isSubmitting || isRefreshing;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <CreateUserCard form={form} isMutating={isMutating} onSubmit={onCreate} />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {isLoading ? (
              <div className="flex h-48 w-full items-center justify-center">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : permissionDenied ? (
              <div className="flex h-48 w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>You do not have permission to view users.</span>
                {loadError ? (
                  <span className="text-xs">{loadError}</span>
                ) : null}
              </div>
            ) : loadError ? (
              <div className="flex h-48 w-full items-center justify-center text-sm text-muted-foreground">
                {loadError}
              </div>
            ) : users.length === 0 ? (
              <div className="flex h-48 w-full items-center justify-center text-sm text-muted-foreground">
                No users found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[160px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{normalizeRoleDisplay(user.role)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.banned ? "destructive" : "secondary"}
                        >
                          {user.banned ? "Banned" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="mr-1 size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPendingDeletion(user)}
                        >
                          <Trash2 className="mr-1 size-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <EditUserDialog
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDeleteUserDialog
        user={pendingDeletion}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
