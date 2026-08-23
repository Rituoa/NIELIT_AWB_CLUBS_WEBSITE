"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth"; // Adjust path if needed
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { revalidatePath } from "next/cache";

// Set up Prisma
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function joinClub(clubId) {

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be logged in to join a club.");
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      clubsJoined: {
        connect: { id: clubId },
      },
    },
  });

  revalidatePath(`/clubs/${clubId}`);
}