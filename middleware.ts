import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the request headers
  const headers = new Headers(request.headers)
  
  // Add custom headers for tracking or authentication if needed
  headers.set('x-middleware-timestamp', new Date().toISOString())
  
  // You can add authentication checks here
  // const authToken = request.cookies.get('auth-token')
  // if (!authToken && request.nextUrl.pathname.startsWith('/api/')) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  // Only process API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Rate limiting could be implemented here
    
    // Modify the request
    const response = NextResponse.next({
      request: {
        headers: headers,
      },
    })

    // Add response headers
    response.headers.set('x-middleware-cache', 'no-cache')
    
    return response
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/api/:path*',
}