import WarpTextClient from '../ui/WarpTextClient';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getServerSession } from "next-auth/next";
import AuthButton from '../ui/AuthButton';
import { authOptions } from "../lib/auth";

// Initialize Prisma with the Postgres Adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// A small helper array to give each card a rotating accent color
const colorClasses = [
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "bg-green-500/10 text-green-400 border-green-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20"
];

export default async function Home() {
  // Check if the user is authenticated on the server
  const session = await getServerSession(authOptions);

  const activeClubs = await prisma.club.findMany({
    include: { lead: true }
  });

  return (
    <main className="min-h-screen bg-black flex flex-col items-center pb-24">
      
      {/* Hero Section */}
      <div className="w-full max-w-6xl mt-[10vh] px-4">
        <WarpTextClient
          text="NIELIT Clubs"
          color="#f8f5ff"
          warpStrength={0.08}
          warpScale={1.7}
          speed={0.55}
          fontSize="clamp(4rem, 12vw, 10rem)"
          style={{ height: '320px' }}
        />
        <p className="text-zinc-400 text-center text-lg md:text-xl font-medium mt-[-40px]">
          Powered by students. Built for the campus.
        </p>
        <AuthButton session="{session}"/>
      </div>

      {/* Club Directory Section */}
      <div className="w-full max-w-6xl px-4 mt-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Active Clubs</h2>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeClubs.length === 0 ? (
            <p className="text-zinc-500">No clubs found in the database yet.</p>
          ) : (
            activeClubs.map((club, index) => {
              const accent = colorClasses[index % colorClasses.length];
              
              return (
                <Link 
                  href={`/clubs/${club.id}`}
                  key={club.id} 
                  className="group relative p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 block"
                >
                  {/* Card Header */}
                  <div className="flex flex-col mb-4">
                    <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {club.name}
                    </h3>
                    {/* This is the new line displaying the lead's name */}
                    <span className="text-xs text-zinc-500 mt-1">
                      Led by {club.lead?.name || "Student"}
                    </span>
                  </div>

                  {/* Card Description */}
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">
                    {club.description}
                  </p>

                  {/* Tags & Footer (Keep this exactly as you have it) */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {club.tags && club.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex} 
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${accent}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

    </main>
  );
}