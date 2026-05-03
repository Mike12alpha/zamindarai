import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.INTERNAL_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const token = request.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = token;
    }

    const res = await fetch(`${API_BASE}/diagnoses/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API /diagnoses] Error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
