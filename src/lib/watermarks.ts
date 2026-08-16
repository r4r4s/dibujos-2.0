const SERVICE_URL =
  process.env.WATERMARKS_SERVICE_URL ?? 'http://127.0.0.1:8765';
const API_KEY = process.env.WATERMARKS_SERVER_API_KEY ?? '';

const ALLOWED_PATHS = new Set(['/health', '/capabilities', '/inspect', '/clean']);

export async function forwardToWatermarks(
  path: string,
  request: Request,
): Promise<Response> {
  if (!ALLOWED_PATHS.has(path)) {
    return Response.json({ ok: false, error: 'not found' }, { status: 404 });
  }

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  if (API_KEY) {
    headers.set('Authorization', `Bearer ${API_KEY}`);
  }

  try {
    const upstream = await fetch(`${SERVICE_URL}${path}`, {
      method: request.method,
      headers,
      body: request.method === 'GET' ? undefined : await request.arrayBuffer(),
    });

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') ?? 'application/json',
        'cache-control': 'no-store',
      },
    });
  } catch {
    return Response.json(
      {
        ok: false,
        error:
          'El servicio de watermarks-remover no está disponible. Arráncalo con npm run watermarks.',
      },
      { status: 503 },
    );
  }
}
