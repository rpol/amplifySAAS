"use client";

import { useTransition } from "react";

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

import { type AdminUser } from "./user-types";

type ConfirmDeleteUserDialogProps = {
  user: AdminUser | null;
  onCancel: () => void;
  onConfirm: (user: AdminUser) => Promise<void>;
};

export function ConfirmDeleteUserDialog({
  user,
  onCancel,
  onConfirm,
}: ConfirmDeleteUserDialogProps) {
  const [isDeleting, startTransition] = useTransition();

  return (
    <AlertDialog
      open={Boolean(user)}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The user and all related sessions will
            be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            disabled={isDeleting}
            onClick={() => {
              if (!user) return;
              startTransition(async () => {
                await onConfirm(user);
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
