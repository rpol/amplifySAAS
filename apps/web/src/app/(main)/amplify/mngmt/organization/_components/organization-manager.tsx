"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { type OrganizationDto } from "@amplify/types/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Edit, Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { CreateOrganizationCard } from "./create-organization-card";
import { EditOrganizationDialog } from "./edit-organization-dialog";
import {
  organizationSchema,
  type OrganizationFormValues,
  safeParseMetadata,
} from "./organization-form";

export function OrganizationManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [editingOrganization, setEditingOrganization] =
    useState<OrganizationDto | null>(null);
  const [pendingDeletion, setPendingDeletion] =
    useState<OrganizationDto | null>(null);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: undefined,
      metadata: undefined,
    },
  });

  const refreshOrganizations = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = ensureClientResponse<OrganizationDto[]>(
        await authClient.organization.list(),
      );
      if (response.error) {
        throw new Error(
          response.error.message ?? "Unable to load organizations.",
        );
      }
      setOrganizations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load organizations", error);
      toast.error("Unable to load organizations.");
      setOrganizations([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshOrganizations();
  }, [refreshOrganizations]);

  const onCreate = (values: OrganizationFormValues) => {
    startSubmitTransition(async () => {
      try {
        const metadata = safeParseMetadata(values.metadata);

        const response = ensureClientResponse<OrganizationDto>(
          await authClient.organization.create({
            name: values.name,
            slug: values.slug,
            logo: values.logo,
            metadata: metadata ?? undefined,
          }),
        );

        if (response.error) {
          throw new Error(
            response.error.message ?? "Unable to create organization.",
          );
        }

        if (response.data) {
          toast.success(`Organization "${response.data.name}" created.`);
          form.reset();
        }
        await refreshOrganizations();
      } catch (error) {
        console.error("Failed to create organization", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to create organization.",
        );
      }
    });
  };

  const handleEditSubmit = async (
    id: string,
    values: OrganizationFormValues,
  ) => {
    try {
      const metadata = safeParseMetadata(values.metadata);
      const response = ensureClientResponse<OrganizationDto>(
        await authClient.organization.update({
          organizationId: id,
          data: {
            name: values.name,
            slug: values.slug,
            logo: values.logo,
            metadata: metadata ?? undefined,
          },
        }),
      );

      if (response.error) {
        throw new Error(
          response.error.message ?? "Unable to update organization.",
        );
      }

      if (response.data) {
        toast.success(`Organization "${response.data.name}" updated.`);
      }
      setEditingOrganization(null);
      await refreshOrganizations();
    } catch (error) {
      console.error("Failed to update organization", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update organization.",
      );
    }
  };

  const handleDelete = async (organization: OrganizationDto) => {
    try {
      const response = ensureClientResponse<unknown>(
        await authClient.organization.delete({
          organizationId: organization.id,
        }),
      );

      if (response.error) {
        throw new Error(
          response.error.message ?? "Unable to delete organization.",
        );
      }
      toast.success(`Organization "${organization.name}" deleted.`);
      setPendingDeletion(null);
      await refreshOrganizations();
    } catch (error) {
      console.error("Failed to delete organization", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete organization.",
      );
    }
  };

  const isMutating = isSubmitting || isRefreshing;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      <CreateOrganizationCard
        form={form}
        isMutating={isMutating}
        onSubmit={onCreate}
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Existing Organizations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative">
            {isLoading ? (
              <div className="flex h-48 w-full items-center justify-center">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="flex h-48 w-full items-center justify-center text-sm text-muted-foreground">
                No organizations found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[140px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((organization) => (
                    <TableRow key={organization.id}>
                      <TableCell className="font-medium">
                        {organization.name}
                      </TableCell>
                      <TableCell>{organization.slug}</TableCell>
                      <TableCell>
                        {format(
                          new Date(organization.createdAt),
                          "MMM d, yyyy",
                        )}
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOrganization(organization)}
                        >
                          <Edit className="mr-1 size-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setPendingDeletion(organization)}
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

      <EditOrganizationDialog
        organization={editingOrganization}
        onClose={() => setEditingOrganization(null)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDeleteDialog
        organization={pendingDeletion}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
