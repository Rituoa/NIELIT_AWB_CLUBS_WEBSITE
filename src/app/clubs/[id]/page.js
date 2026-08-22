import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';


const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// In a real app, you would fetch this from your database using the ID
const getClubData = (id) => {
  const clubs = {
    "1": { name: "Coding & Algorithms", desc: "Competitive programming and hackathons.", lead: "Aarav Sharma" },
    "2": { name: "Electronics & EV Drive", desc: "Circuit design and MATLAB simulations.", lead: "Priya Patel" },
    "6": { name: "Sports & Motorsports", desc: "Campus tournaments and racing setups.", lead: "Rohan Verma" }
  };
  return clubs[id] || { name: "Club Not Found", desc: "This club doesn't exist." };
};

export default function ClubPage({ params }) {
  // Extract the ID from the URL (e.g., /clubs/2 -> id = 2)
  const clubId = params.id; 
  const club = getClubData(clubId);

  return (
    <main className="min-h-screen bg-black text-white p-12">
      <Link href="/" className="text-zinc-400 hover:text-white mb-8 inline-block">
        &larr; Back to Directory
      </Link>
      
      <h1 className="text-5xl font-bold mb-4">{club.name}</h1>
      <p className="text-xl text-zinc-400 mb-8">{club.desc}</p>
      
      <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 max-w-md">
        <h3 className="text-lg font-semibold mb-2">Club Details</h3>
        <p className="text-zinc-400"><strong>Club ID:</strong> {clubId}</p>
        <p className="text-zinc-400"><strong>Student Lead:</strong> {club.lead}</p>
      </div>
    </main>
  );
}