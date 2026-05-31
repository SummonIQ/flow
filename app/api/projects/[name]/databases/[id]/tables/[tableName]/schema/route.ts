import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Client } from 'pg';

interface RouteContext {
  params: Promise<{ name: string; id: string; tableName: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id, tableName } = await context.params;

    const database = await prisma.database.findUnique({
      where: { id },
    });

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    const client = new Client({
      host: database.host,
      port: database.port,
      user: database.username,
      password: database.password,
      database: database.database,
    });

    try {
      await client.connect();

      // Get column information
      const result = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      // Get primary keys
      const pkResult = await client.query(`
        SELECT a.attname
        FROM   pg_index i
        JOIN   pg_attribute a ON a.attrelid = i.indrelid
                             AND a.attnum = ANY(i.indkey)
        WHERE  i.indrelid = $1::regclass
        AND    i.indisprimary;
      `, [tableName]);

      // Get foreign keys
      const fkResult = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1;
      `, [tableName]);

      await client.end();

      const primaryKeys = new Set(pkResult.rows.map((row: any) => row.attname));
      const foreignKeys = new Map(
        fkResult.rows.map((row: any) => [
          row.column_name,
          `${row.foreign_table_name}.${row.foreign_column_name}`
        ])
      );

      const columns = result.rows.map((row: any) => ({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        primaryKey: primaryKeys.has(row.column_name),
        foreignKey: foreignKeys.get(row.column_name),
      }));

      return NextResponse.json(columns);
    } catch (dbError) {
      await client.end();
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to query table schema' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching table schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table schema' },
      { status: 500 }
    );
  }
}
