import { prisma } from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

interface RouteContext {
  params: Promise<{ name: string; id: string; tableName: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id, tableName } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const database = await prisma.database.findUnique({
      where: { id },
    });

    if (!database) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 },
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

      // Build search condition if provided
      let whereClause = '';
      const searchValues: string[] = [];
      if (search) {
        // Get text columns for search
        const columnsResult = await client.query(
          `
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = $1
            AND data_type IN ('text', 'character varying', 'character');
        `,
          [tableName],
        );

        if (columnsResult.rows.length > 0) {
          const searchConditions = columnsResult.rows
            .map(
              (row: any, idx) => `"${row.column_name}"::text ILIKE $${idx + 1}`,
            )
            .join(' OR ');
          whereClause = `WHERE ${searchConditions}`;

          searchValues.push(...columnsResult.rows.map(() => `%${search}%`));
        }
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM "${tableName}" ${whereClause}`;
      const countResult = await client.query(countQuery, searchValues);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const limitIndex = searchValues.length + 1;
      const offsetIndex = searchValues.length + 2;
      const dataQuery = `SELECT * FROM "${tableName}" ${whereClause} LIMIT $${limitIndex} OFFSET $${offsetIndex}`;
      const dataResult = await client.query(dataQuery, [
        ...searchValues,
        limit,
        offset,
      ]);

      await client.end();

      return NextResponse.json({
        data: dataResult.rows,
        total,
        page,
        limit,
      });
    } catch (dbError) {
      await client.end();
      console.error('Database query error:', dbError);
      return NextResponse.json(
        { error: 'Failed to query table data' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error fetching table data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 },
    );
  }
}
