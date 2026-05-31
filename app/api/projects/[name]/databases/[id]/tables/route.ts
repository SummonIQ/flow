import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Client } from 'pg';

interface RouteContext {
  params: Promise<{ name: string; id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const database = await prisma.database.findUnique({
      where: { id },
    });

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    if (database.status !== 'running') {
      return NextResponse.json(
        { error: 'Database is not running' },
        { status: 400 }
      );
    }

    // Connect to the database and query tables
    const client = new Client({
      host: database.host,
      port: database.port,
      user: database.username,
      password: database.password,
      database: database.database,
    });

    try {
      await client.connect();

      // Query to get all tables with row counts
      const result = await client.query(`
        SELECT 
          table_name,
          table_schema,
          (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
        FROM (
          SELECT 
            table_name, 
            table_schema,
            query_to_xml(format('SELECT COUNT(*) as cnt FROM %I.%I', table_schema, table_name), false, true, '') as xml_count
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        ) t
        ORDER BY table_name;
      `);

      await client.end();

      const tables = result.rows.map((row) => ({
        name: row.table_name,
        schema: row.table_schema,
        rowCount: parseInt(row.row_count) || 0,
      }));

      return NextResponse.json(tables);
    } catch (dbError) {
      await client.end();
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to query database tables' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}
