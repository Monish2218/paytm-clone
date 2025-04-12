import { prisma } from "@repo/db";

export default async function Home() {
  const user = await prisma.user.findFirst() 
  return (
    <div className="text-3xl font-bold underline">
      Hello from Payments App with Prisma
      <br />
      <br />
      <strong>First user:</strong>
      <br />
      {user?.email ?? "No user added yet"}
      <br />
      <strong>First user name:</strong>
      <br />
      {user?.name ?? "No user added yet"}
    </div>
  );
}