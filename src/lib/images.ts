// src/lib/svgFlatten.ts
export async function flattenSVG(svg: SVGSVGElement, scale = 1): Promise<string> {
  const img = await svgToImage(svg);
  const width = svg.viewBox.baseVal.width * scale;
  const height = svg.viewBox.baseVal.height * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0, width, height);

  // Return PNG as data URL
  return canvas.toDataURL('image/png');
}

function serializeSVG(svg: SVGSVGElement): string {
  let source = new XMLSerializer().serializeToString(svg);

  // Add missing namespaces
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  return source;
}

function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const svgString = serializeSVG(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function toBase64(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
