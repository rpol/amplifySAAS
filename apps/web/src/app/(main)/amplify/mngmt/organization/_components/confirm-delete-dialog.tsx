"use client";

import { useTransition } from "react";

import { type OrganizationDto } from "@amplify/types/organization";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

export type ConfirmDeleteDialogProps = {
  readonly organization: OrganizationDto | null;
  readonly onCancel: () => void;
  readonly onConfirm: (organization: OrganizationDto) => Promise<void>;
};

export function ConfirmDeleteDialog({
  organization,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [isDeleting, startTransition] = useTransition();

  return (
    <AlertDialog
      open={Boolean(organization)}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete organization</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove the
            organization and its associated members.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            disabled={isDeleting}
            onClick={() => {
              if (!organization) return;
              startTransition(async () => {
                await onConfirm(organization);
              });
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
