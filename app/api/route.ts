import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Example response for the API route
    const data = {
        message: 'Welcome to the Personal Finance Assistant API',
    };

    return NextResponse.json(data);
}