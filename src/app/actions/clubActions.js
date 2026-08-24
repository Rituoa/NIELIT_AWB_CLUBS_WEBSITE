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
  if (!session?.user?.email) throw new Error("Unauthorized");

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { president: true, vicePresident: true, technicalHead: true }
  });
  
  const userEmail = session.user.email;
  const isLeadership = 
    club.president?.email === userEmail || 
    club.vicePresident?.email === userEmail || 
    club.technicalHead?.email === userEmail;

  if (!isLeadership) {
    throw new Error("Security Error: Only the Executive Board can post announcements.");
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
    include: { president: true, vicePresident: true, technicalHead: true }
  });

  const userEmail = session.user.email;
  const isLeadership = 
    club.president?.email === userEmail || 
    club.vicePresident?.email === userEmail || 
    club.technicalHead?.email === userEmail;

  if (!isLeadership) {
    throw new Error("Security Error: Only the Executive Board can create events.");
  }

  const title = formData.get("title");
  const description = formData.get("description");
  const location = formData.get("location");
  const date = new Date(formData.get("date")); 

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

export async function leaveClub(clubId) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      clubsJoined: {
        disconnect: { id: clubId },
      },
    },
  });

  revalidatePath('/profile');
  revalidatePath(`/clubs/${clubId}`);
}

export async function createProject(clubId, formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { president: true, vicePresident: true, technicalHead: true }
  });

  const userEmail = session.user.email;
  const isLeadership = 
    club.president?.email === userEmail || 
    club.vicePresident?.email === userEmail || 
    club.technicalHead?.email === userEmail;

  if (!isLeadership) throw new Error("Only leadership can post projects.");

  await prisma.project.create({
    data: {
      title: formData.get("title"),
      description: formData.get("description"),
      link: formData.get("link") || null,
      clubId,
    },
  });

  revalidatePath(`/clubs/${clubId}`);
}

export async function addResource(clubId, formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { president: true, vicePresident: true, technicalHead: true }
  });

  const userEmail = session.user.email;
  const isLeadership = 
    club.president?.email === userEmail || 
    club.vicePresident?.email === userEmail || 
    club.technicalHead?.email === userEmail;

  if (!isLeadership) throw new Error("Only leadership can add resources.");

  await prisma.resource.create({
    data: {
      title: formData.get("title"),
      url: formData.get("url"),
      type: formData.get("type"),
      clubId,
    },
  });

  revalidatePath(`/clubs/${clubId}`);
}