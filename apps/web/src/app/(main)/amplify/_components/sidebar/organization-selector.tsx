"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { type OrganizationDto } from "@amplify/types/organization";
import {
  Check,
  ChevronDown,
  Command,
  Loader2,
  Plus,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { authClient } from "@/lib/auth-client";
import { ensureClientResponse } from "@/lib/auth-client-helpers";
import { getInitials } from "@/lib/utils";

const DEFAULT_ERROR_MESSAGE = "Unable to load organizations.";

type OrganizationOption = Pick<
  OrganizationDto,
  "id" | "name" | "slug" | "logo"
>;

type OrganizationListResult = Awaited<
  ReturnType<typeof authClient.organization.list>
>;

type ActiveOrganizationResult = Awaited<ReturnType<typeof authClient.$fetch>>;

function resolveOrganizations(
  listResult: OrganizationListResult,
): OrganizationOption[] {
  const listResponse = ensureClientResponse<OrganizationDto[]>(listResult);
  if (listResponse.error) {
    throw new Error(listResponse.error.message ?? DEFAULT_ERROR_MESSAGE);
  }

  const organizations = Array.isArray(listResponse.data)
    ? listResponse.data
    : [];

  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo ?? null,
  }));
}

function resolveActiveOrganizationId(
  activeResult: ActiveOrganizationResult,
  organizations: OrganizationOption[],
): string | null {
  const activeResponse =
    ensureClientResponse<Record<string, unknown>>(activeResult);

  if (activeResponse.error) {
    return organizations[0]?.id ?? null;
  }

  const activeData = activeResponse.data;
  if (
    activeData &&
    typeof activeData === "object" &&
    "id" in activeData &&
    typeof (activeData as { id?: unknown }).id === "string"
  ) {
    return (activeData as { id: string }).id;
  }

  return organizations[0]?.id ?? null;
}

function formatErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function OrganizationSelector() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [pendingOrganizationId, setPendingOrganizationId] = useState<
    string | null
  >(null);
  const isMountedRef = useRef(true);

  const handleLoadError = useCallback(
    (error: unknown, suppressToast?: boolean) => {
      console.error("Failed to load organizations", error);
      setOrganizations([]);
      setActiveOrganizationId(null);

      if (!suppressToast) {
        toast.error(formatErrorMessage(error, DEFAULT_ERROR_MESSAGE));
      }
    },
    [],
  );

  const loadOrganizations = useCallback(
    async (options: { suppressToast?: boolean } = {}) => {
      setIsLoading(true);
      try {
        const [listResult, activeResult] = await Promise.all([
          authClient.organization.list(),
          authClient.$fetch("/organization/get-full-organization", {
            method: "GET",
            throw: false,
          }),
        ]);

        if (!isMountedRef.current) {
          return;
        }

        const mappedOrganizations = resolveOrganizations(listResult);
        const activeId = resolveActiveOrganizationId(
          activeResult,
          mappedOrganizations,
        );

        setOrganizations(mappedOrganizations);
        setActiveOrganizationId(activeId);
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }
        handleLoadError(error, options.suppressToast);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [handleLoadError],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadOrganizations();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadOrganizations]);

  const activeOrganization = useMemo(() => {
    if (!activeOrganizationId) {
      return null;
    }

    return (
      organizations.find(
        (organization) => organization.id === activeOrganizationId,
      ) ?? null
    );
  }, [activeOrganizationId, organizations]);

  const handleSelect = useCallback(
    (organization: OrganizationOption) => {
      if (isSwitching || organization.id === activeOrganizationId) {
        return;
      }

      const previousOrganizationId = activeOrganizationId;
      setIsSwitching(true);
      setPendingOrganizationId(organization.id);
      setActiveOrganizationId(organization.id);

      (async () => {
        try {
          const response = await authClient.$fetch("/organization/set-active", {
            method: "POST",
            body: { organizationId: organization.id },
            throw: false,
          });

          const parsed = ensureClientResponse<unknown>(response);
          if (parsed.error) {
            throw new Error(
              parsed.error.message ?? "Unable to switch organization.",
            );
          }

          toast.success(`Switched to ${organization.name}`);
          router.refresh();
        } catch (error) {
          console.error("Failed to set active organization", error);
          setActiveOrganizationId(previousOrganizationId ?? null);
          toast.error(
            formatErrorMessage(error, "Unable to switch organization."),
          );
        } finally {
          setIsSwitching(false);
          setPendingOrganizationId(null);
        }
      })();
    },
    [activeOrganizationId, isSwitching, router],
  );

  const description = useMemo(() => {
    if (isLoading) {
      return "Loading organizations...";
    }

    if (organizations.length === 0) {
      return "No organizations found";
    }

    return "Switch organization";
  }, [isLoading, organizations.length]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          void loadOrganizations({ suppressToast: true });
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
          <Command className="mr-2 size-4" />
          <div className="flex min-w-0 flex-1 flex-col text-left">
            <span className="truncate text-base font-semibold">
              {activeOrganization?.name ?? APP_CONFIG.name}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {description}
            </span>
          </div>
          {isSwitching ? (
            <Loader2 className="ml-auto size-4 animate-spin" />
          ) : (
            <ChevronDown className="ml-auto size-4 opacity-70" />
          )}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
          <Command className="size-3" />
          Organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading organizations...
          </div>
        ) : organizations.length === 0 ? (
          <DropdownMenuItem
            onSelect={() => {
              router.push("/amplify/mngmt/organization");
            }}
          >
            <Plus className="mr-2 size-4" />
            Create organization
          </DropdownMenuItem>
        ) : (
          organizations.map((organization) => (
            <DropdownMenuItem
              key={organization.id}
              className="flex items-center gap-3"
              onSelect={() => handleSelect(organization)}
            >
              <Avatar className="size-8 rounded-md">
                <AvatarImage
                  src={organization.logo ?? undefined}
                  alt={organization.name}
                />
                <AvatarFallback className="rounded-md text-xs">
                  {getInitials(organization.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {organization.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {organization.slug}
                </span>
              </div>
              {organization.id === activeOrganizationId ? (
                <Check className="ml-auto size-4 text-primary" />
              ) : pendingOrganizationId === organization.id ? (
                <Loader2 className="ml-auto size-4 animate-spin text-muted-foreground" />
              ) : null}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            router.push("/amplify/mngmt/organization");
          }}
        >
          <Settings className="mr-2 size-4" />
          Manage organizations
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
