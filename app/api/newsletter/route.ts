import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listId = parseInt(process.env.BREVO_LIST_ID || '3', 10);

    if (!apiKey) {
      return NextResponse.json({ error: 'Brevo API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName || '',
          LASTNAME: lastName || '',
        },
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (response.status === 204) {
      return NextResponse.json({ success: true, message: 'Subscribed successfully (updated)' });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to subscribe' }, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
