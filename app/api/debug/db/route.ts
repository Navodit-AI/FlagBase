import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    const columns = await sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`
    
    return NextResponse.json({
      tables,
      columns
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
