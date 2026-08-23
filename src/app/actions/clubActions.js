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

export async function postAnnouncement(clubId, formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { lead: true }
  });

  if (club.lead.email !== session.user.email) {
    throw new Error("Security Error: Only the Club Lead can post announcements.");
  }

  const title = formData.get("title");
  const content = formData.get("content");

  await prisma.announcement.create({
    data: {
      title,
      content,
      clubId,
    },
  });

  revalidatePath(`/clubs/${clubId}`);
}

export async function createEvent(clubId, formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { lead: true }
  });

  if (club.lead.email !== session.user.email) {
    throw new Error("Only the Club Lead can create events.");
  }

  const title = formData.get("title");
  const description = formData.get("description");
  const location = formData.get("location");
  
  const date = new Date(formData.get("date")); 

  // 4. Save to Database
  await prisma.event.create({
    data: {
      title,
      description,
      location,
      date,
      clubId,
    },
  });

  revalidatePath(`/clubs/${clubId}`);
}