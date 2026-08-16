import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ACCEPT = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.pdf',
  '.docx',
  '.odt',
  '.html',
  '.htm',
  '.md',
  '.markdown',
  '.txt',
].join(',');

type ServiceStatus = 'checking' | 'online' | 'offline';

type InspectResult = {
  ok: boolean;
  kind?: string;
  suspicious?: boolean;
  report?: Record<string, unknown>;
  error?: string;
};

type CleanResult = {
  ok: boolean;
  kind?: string;
  cleaned?: string;
  report?: Record<string, unknown>;
  error?: string;
};

type Capabilities = {
  tools?: Record<string, boolean>;
  pixel_backends?: Record<string, boolean>;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function cleanedName(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return `${name}.cleaned`;
  return `${name.slice(0, dot)}.cleaned${name.slice(dot)}`;
}

function downloadBase64(b64: string, name: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const url = URL.createObjectURL(new Blob([bytes]));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function summarizeReport(report: Record<string, unknown> | undefined): string[] {
  if (!report) return [];
  const lines: string[] = [];
  const pick = [
    'kind',
    'has_c2pa',
    'has_ai_metadata',
    'suspicious_total',
    'actions',
    'stats',
    'warning',
    'notes',
  ];
  for (const key of pick) {
    if (report[key] === undefined || report[key] === null) continue;
    const value = report[key];
    lines.push(
      `${key}: ${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}`,
    );
  }
  if (lines.length === 0) {
    lines.push(JSON.stringify(report, null, 2));
  }
  return lines;
}

export default function WatermarkRemover() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ServiceStatus>('checking');
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState<'inspect' | 'clean' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inspect, setInspect] = useState<InspectResult | null>(null);
  const [clean, setClean] = useState<CleanResult | null>(null);
  const [stripAllMetadata, setStripAllMetadata] = useState(true);
  const [alsoLayerA, setAlsoLayerA] = useState(true);
  const [nfkc, setNfkc] = useState(false);

  const pixelBackend = useMemo(() => {
    const backends = capabilities?.pixel_backends ?? {};
    if (backends.ctrlregen) return 'ctrlregen';
    if (backends.diffusion) return 'diffusion';
    return null;
  }, [capabilities]);

  const refreshStatus = useCallback(async () => {
    try {
      const [healthRes, capsRes] = await Promise.all([
        fetch('/api/watermarks/health'),
        fetch('/api/watermarks/capabilities'),
      ]);
      const health = (await healthRes.json()) as { ok?: boolean };
      if (!healthRes.ok || !health.ok) {
        setStatus('offline');
        setCapabilities(null);
        return;
      }
      setStatus('online');
      if (capsRes.ok) {
        setCapabilities((await capsRes.json()) as Capabilities);
      }
    } catch {
      setStatus('offline');
      setCapabilities(null);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    const id = window.setInterval(() => void refreshStatus(), 8000);
    return () => window.clearInterval(id);
  }, [refreshStatus]);

  const chooseFile = (next: File | null) => {
    setError(null);
    setInspect(null);
    setClean(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setFile(null);
      setError(`El archivo supera el límite de ${formatBytes(MAX_FILE_BYTES)}.`);
      return;
    }
    setFile(next);
  };

  const postFile = async (path: 'inspect' | 'clean') => {
    if (!file) return;
    setBusy(path);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        file: await fileToBase64(file),
        name: file.name,
      };
      if (path === 'clean') {
        payload.options = {
          strip_all_metadata: stripAllMetadata,
          also_layer_a_text: alsoLayerA,
          nfkc,
        };
      }
      const response = await fetch(`/api/watermarks/${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as InspectResult & CleanResult;
      if (!response.ok || !data.ok) {
        setError(data.error ?? 'No se pudo completar la operación.');
        return;
      }
      if (path === 'inspect') {
        setInspect(data);
        return;
      }
      setClean(data);
      if (data.cleaned) {
        downloadBase64(data.cleaned, cleanedName(file.name));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Error de red.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-ochre uppercase">
            Dibujos 2.0
          </p>
          <h1 className="font-serif mt-1 text-4xl font-medium tracking-tight">
            Quitar marcas de procedencia
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink/70">
            Limpia C2PA, EXIF/XMP y Unicode invisible de imágenes, PDF, SVG y
            documentos. El trabajo lo hace{' '}
            <a
              className="underline decoration-rule underline-offset-4 hover:text-ochre"
              href="https://github.com/guillaumemeyer/watermarks-remover"
              rel="noreferrer"
              target="_blank"
            >
              watermarks-remover
            </a>
            .
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-rule bg-white/60 px-3 py-1.5 text-sm"
          onClick={() => void refreshStatus()}
          type="button"
        >
          <span
            className={`size-2 rounded-full ${
              status === 'online'
                ? 'bg-moss'
                : status === 'checking'
                  ? 'bg-ochre/60'
                  : 'bg-ochre'
            }`}
          />
          {status === 'online'
            ? 'Servicio activo'
            : status === 'checking'
              ? 'Comprobando…'
              : 'Servicio parado'}
        </button>
      </header>

      {status === 'offline' && (
        <div className="mb-6 rounded-2xl border border-ochre/30 bg-ochre/8 px-4 py-3 text-sm leading-relaxed">
          Arranca el servicio en otra terminal con{' '}
          <code className="rounded bg-ink/8 px-1.5 py-0.5 font-medium">
            npm run watermarks
          </code>{' '}
          o con{' '}
          <code className="rounded bg-ink/8 px-1.5 py-0.5 font-medium">
            docker compose up -d
          </code>
          .
        </div>
      )}

      <section
        className={`rounded-3xl border-2 border-dashed p-8 transition-colors ${
          dragOver ? 'border-ochre bg-ochre/8' : 'border-rule bg-white/50'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          chooseFile(event.dataTransfer.files[0] ?? null);
        }}
      >
        <input
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          ref={inputRef}
          type="file"
        />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-2xl">Suelta un archivo aquí</p>
            <p className="mt-1 text-sm text-ink/60">
              PNG, JPEG, WebP, SVG, PDF, DOCX, ODT, HTML o Markdown. Máximo{' '}
              {formatBytes(MAX_FILE_BYTES)}.
            </p>
            {file && (
              <p className="mt-3 text-sm font-medium">
                {file.name}{' '}
                <span className="font-normal text-ink/55">
                  · {formatBytes(file.size)}
                </span>
              </p>
            )}
          </div>
          <button
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            Elegir archivo
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <label className="flex items-center gap-2 rounded-2xl border border-rule bg-white/50 px-4 py-3">
          <input
            checked={stripAllMetadata}
            onChange={(event) => setStripAllMetadata(event.target.checked)}
            type="checkbox"
          />
          Quitar todo el metadato
        </label>
        <label className="flex items-center gap-2 rounded-2xl border border-rule bg-white/50 px-4 py-3">
          <input
            checked={alsoLayerA}
            onChange={(event) => setAlsoLayerA(event.target.checked)}
            type="checkbox"
          />
          Unicode invisible
        </label>
        <label className="flex items-center gap-2 rounded-2xl border border-rule bg-white/50 px-4 py-3">
          <input
            checked={nfkc}
            onChange={(event) => setNfkc(event.target.checked)}
            type="checkbox"
          />
          Normalizar NFKC
        </label>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-full border border-ink px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          disabled={!file || status !== 'online' || busy !== null}
          onClick={() => void postFile('inspect')}
          type="button"
        >
          {busy === 'inspect' ? 'Inspeccionando…' : 'Inspeccionar'}
        </button>
        <button
          className="rounded-full bg-ochre px-5 py-2.5 text-sm font-medium text-white hover:bg-ochre-dark disabled:opacity-40"
          disabled={!file || status !== 'online' || busy !== null}
          onClick={() => void postFile('clean')}
          type="button"
        >
          {busy === 'clean' ? 'Limpiando…' : 'Limpiar y descargar'}
        </button>
      </div>

      {pixelBackend && (
        <p className="mt-3 text-xs text-ink/55">
          Backend de píxel disponible ({pixelBackend}). Esta interfaz solo
          limpia metadatos; la regeneración de píxeles sigue siendo opcional
          en el servicio.
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-2xl border border-ochre/40 bg-ochre/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {inspect && (
        <section className="mt-8 rounded-3xl border border-rule bg-white/70 p-5">
          <h2 className="font-serif text-xl">Inspección</h2>
          <p className="mt-1 text-sm text-ink/65">
            Tipo: {inspect.kind ?? 'desconocido'} ·{' '}
            {inspect.suspicious
              ? 'Hay señales de procedencia'
              : 'No se vieron marcas evidentes'}
          </p>
          <pre className="mt-4 overflow-x-auto text-xs leading-relaxed text-ink/80">
            {summarizeReport(inspect.report).join('\n')}
          </pre>
        </section>
      )}

      {clean?.cleaned && (
        <section className="mt-6 rounded-3xl border border-moss/30 bg-moss/8 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl">Archivo limpio</h2>
              <p className="mt-1 text-sm text-ink/65">
                Listo para guardar como {cleanedName(file?.name ?? 'archivo')}.
              </p>
            </div>
            <button
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
              onClick={() =>
                downloadBase64(
                  clean.cleaned!,
                  cleanedName(file?.name ?? 'archivo'),
                )
              }
              type="button"
            >
              Descargar
            </button>
          </div>
          <pre className="mt-4 overflow-x-auto text-xs leading-relaxed text-ink/80">
            {summarizeReport(clean.report).join('\n')}
          </pre>
        </section>
      )}
    </main>
  );
}
