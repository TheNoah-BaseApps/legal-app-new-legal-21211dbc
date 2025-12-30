import { verifyToken } from './jwt';

export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, user: null };
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return { authenticated: false, user: null };
    }

    return {
      authenticated: true,
      user: payload,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, user: null };
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    request.user = authResult.user;
    return handler(request, context);
  };
}