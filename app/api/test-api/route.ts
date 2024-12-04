import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { apiUrl, apiMethod, apiKey, headers } = data;

  try {
    const response = await fetch(apiUrl, {
      method: apiMethod,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...headers
      }
    });

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error testing API:', error);
    return NextResponse.json({ error: 'Failed to test API' }, { status: 500 });
  }
}


