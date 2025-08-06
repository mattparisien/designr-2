import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BACKEND_API_URL;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: 'Template ID is required' }, { status: 400 });
  }

  const res = await fetch(`${BASE_URL}/templates/${id}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: 'Template ID is required' }, { status: 400 });
  }

  const res = await fetch(`${BASE_URL}/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: 'Template ID is required' }, { status: 400 });
  }
  const res = await fetch(`${BASE_URL}/templates/${id}`, {
    method: 'DELETE',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
