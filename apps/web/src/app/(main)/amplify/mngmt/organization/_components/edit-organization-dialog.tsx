"use client";

import { useEffect, useTransition } from "react";

import { type OrganizationDto } from "@amplify/types/organization";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  organizationSchema,
  OrganizationFormValues,
} from "./organization-form";

export type EditOrganizationDialogProps = {
  readonly organization: OrganizationDto | null;
  readonly onClose: () => void;
  readonly onSubmit: (
    id: string,
    values: OrganizationFormValues,
  ) => Promise<void>;
};

export function EditOrganizationDialog({
  organization,
  onClose,
  onSubmit,
}: EditOrganizationDialogProps) {
  const [isSaving, startTransition] = useTransition();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name ?? "",
      slug: organization?.slug ?? "",
      logo: organization?.logo ?? undefined,
      metadata: organization?.metadata
        ? JSON.stringify(organization.metadata, null, 2)
        : undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: organization?.name ?? "",
      slug: organization?.slug ?? "",
      logo: organization?.logo ?? undefined,
      metadata: organization?.metadata
        ? JSON.stringify(organization.metadata, null, 2)
        : undefined,
    });
  }, [organization, form]);

  const handleSubmit = (values: OrganizationFormValues) => {
    if (!organization) return;
    startTransition(async () => {
      await onSubmit(organization.id, values);
    });
  };

  return (
    <Dialog
      open={Boolean(organization)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update the organization details and save your changes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metadata (JSON)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
