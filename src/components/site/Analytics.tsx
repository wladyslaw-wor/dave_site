import Script from "next/script";

function parseTrackingCode(code: string) {
  const externalSrcs: string[] = [];
  const inlineScripts: string[] = [];
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptPattern.exec(code))) {
    const [, attrs, body] = match;
    const srcMatch = /\ssrc=["']([^"']+)["']/i.exec(attrs);
    if (srcMatch) {
      externalSrcs.push(srcMatch[1]);
    } else if (body.trim()) {
      inlineScripts.push(body);
    }
  }

  const noscriptMatch = /<noscript>([\s\S]*?)<\/noscript>/i.exec(code);

  return { externalSrcs, inlineScripts, noscriptHtml: noscriptMatch?.[1] ?? null };
}

function TrackingCode({ code, idPrefix }: { code: string; idPrefix: string }) {
  if (!code.trim()) return null;
  const { externalSrcs, inlineScripts, noscriptHtml } = parseTrackingCode(code);

  return (
    <>
      {externalSrcs.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
      {inlineScripts.map((script, i) => (
        <Script key={`${idPrefix}-${i}`} id={`${idPrefix}-${i}`} strategy="afterInteractive">
          {script}
        </Script>
      ))}
      {noscriptHtml ? <noscript dangerouslySetInnerHTML={{ __html: noscriptHtml }} /> : null}
    </>
  );
}

export function Analytics({
  googleAnalyticsCode,
  yandexMetrikaCode,
}: {
  googleAnalyticsCode: string;
  yandexMetrikaCode: string;
}) {
  return (
    <>
      <TrackingCode code={googleAnalyticsCode} idPrefix="ga-custom" />
      <TrackingCode code={yandexMetrikaCode} idPrefix="ym-custom" />
    </>
  );
}
