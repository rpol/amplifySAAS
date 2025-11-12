import { redirect } from "next/navigation";

export default function Home() {
  redirect("/amplify/default");
  return <>Coming Soon</>;
}
