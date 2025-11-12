"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { type AuthUserSummary } from "@amplify/types";
import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { ensureClientResponse } from "@/lib/auth-client-helpers";
import { cn, getInitials } from "@/lib/utils";

export function AccountSwitcher({
  currentUser,
  impersonatedBy,
  accounts,
}: {
  readonly currentUser: AuthUserSummary | null;
  readonly impersonatedBy?: string | null;
  readonly accounts?: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
    readonly role: string;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  type SwitcherAccount = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar?: string | null;
    readonly role: string;
  };

  const accountItems = useMemo<SwitcherAccount[]>(() => {
    if (accounts && accounts.length > 0) {
      return accounts.map((account) => ({ ...account }));
    }

    if (!currentUser) {
      return [];
    }

    return [
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: null,
        role: currentUser.role,
      },
    ];
  }, [accounts, currentUser]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    () => accounts?.[0]?.id ?? currentUser?.id ?? null,
  );

  const activeUser = useMemo(() => {
    if (accountItems.length === 0) {
      return null;
    }

    if (!selectedUserId) {
      return accountItems[0];
    }

    return (
      accountItems.find((account) => account.id === selectedUserId) ??
      accountItems[0]
    );
  }, [accountItems, selectedUserId]);

  if (!activeUser) {
    return null;
  }

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const result = ensureClientResponse<unknown>(
          await authClient.signOut(),
        );

        if (result.error) {
          throw new Error(result.error.message ?? "Failed to log out.");
        }

        toast.success("Logged out successfully.");
        router.replace("/auth/v2/login");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to log out. Please try again.";
        toast.error(message);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-lg">
          <AvatarImage
            src={activeUser.avatar ?? undefined}
            alt={activeUser.name}
          />
          <AvatarFallback className="rounded-lg">
            {getInitials(activeUser.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 space-y-1 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        {accountItems.map((user) => (
          <DropdownMenuItem
            key={user.email}
            className={cn(
              "p-0",
              user.id === activeUser.id &&
                "bg-accent/50 border-l-primary border-l-2",
            )}
            onClick={() => setSelectedUserId(user.id)}
          >
            <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
              <Avatar className="size-9 rounded-lg">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs capitalize">{user.role}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onSelect={(event) => {
            event.preventDefault();
            if (!isPending) {
              handleLogout();
            }
          }}
        >
          <LogOut className={isPending ? "animate-pulse" : undefined} />
          {isPending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
        {impersonatedBy ? (
          <DropdownMenuItem
            disabled
            className="flex-col items-start gap-0 text-xs text-destructive"
          >
            <span>Impersonated by {impersonatedBy}</span>
            <span className="text-muted-foreground">
              Logging out will return to your account.
            </span>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
