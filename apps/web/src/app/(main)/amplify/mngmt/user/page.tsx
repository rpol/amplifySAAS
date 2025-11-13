import { UserManager } from "./_components/user-manager";

export default function Page() {
  return (
    <div className="@container/main flex flex-col gap-6">
      <UserManager />
    </div>
  );
}
