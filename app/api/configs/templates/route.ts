import { NextRequest, NextResponse } from 'next/server';
import { ConfigService } from '@/lib/config/service';

/**
 * GET /api/configs/templates - List all config templates
 * GET /api/configs/templates?type=eslint - Filter by type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const configType = searchParams.get('type');

    const templates = await ConfigService.getTemplates(
      configType ? { configType: configType as any } : undefined
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/configs/templates - Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const template = await ConfigService.createTemplate({
      name: data.name,
      configType: data.type,
      scope: data.scope || 'global',
      description: data.description,
      content: data.content,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/configs/templates - Update a template
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    const template = await ConfigService.updateTemplate(id, updateData);

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/configs/templates?id=xxx - Delete a template
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await ConfigService.deleteTemplate(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
