import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as unknown as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as unknown as string;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);
if (typeof supabaseUrl !== 'string' || typeof supabaseKey !== 'string') {
  throw new Error('Supabase URL or Key is not a valid string');
}


const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('books') // Replace 'books' with your actual table name
        .select('*'); // Fetch all columns

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error: unknown) {
      return res.status(500).json({ error: (error as Error).message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 