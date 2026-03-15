/**
 * 이미지 전처리 유틸
 *
 * 1. 투명 여백(transparent padding) 자동 크롭
 * 2. 최대 크기 리사이즈 (기본 max 800px)
 * 3. WebP로 변환 출력 (투명도 유지 + 압축률 우수)
 */

const MAX_SIZE    = 800   // px (가로/세로 중 긴 쪽 기준)
const ALPHA_THRESHOLD = 10  // 0~255, 이 값 이하 알파는 투명으로 간주
const OUTPUT_QUALITY  = 0.88

/** 투명 여백 제거 후 리사이즈한 File 반환 */
export async function processRegionImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = bitmap

  // ── 1. 원본 크기 캔버스에 그리기 ──────────────────────────
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width  = width
  srcCanvas.height = height
  const srcCtx = srcCanvas.getContext('2d')!
  srcCtx.drawImage(bitmap, 0, 0)
  bitmap.close()

  // ── 2. 투명 여백 bounding box 탐색 ───────────────────────
  const pixels = srcCtx.getImageData(0, 0, width, height)
  const { data } = pixels

  let minX = width, maxX = 0, minY = height, maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // 완전 투명 이미지이면 원본 그대로 사용
  const cropW = maxX > minX ? maxX - minX + 1 : width
  const cropH = maxY > minY ? maxY - minY + 1 : height
  const cropX = maxX > minX ? minX : 0
  const cropY = maxY > minY ? minY : 0

  // ── 3. 리사이즈 계산 ──────────────────────────────────────
  const scale  = Math.min(1, MAX_SIZE / Math.max(cropW, cropH))
  const outW   = Math.round(cropW * scale)
  const outH   = Math.round(cropH * scale)

  // ── 4. 크롭 + 리사이즈 캔버스 ────────────────────────────
  const outCanvas = document.createElement('canvas')
  outCanvas.width  = outW
  outCanvas.height = outH
  const outCtx = outCanvas.getContext('2d')!

  outCtx.drawImage(srcCanvas, cropX, cropY, cropW, cropH, 0, 0, outW, outH)

  // ── 5. WebP Blob 변환 ────────────────────────────────────
  const blob = await new Promise<Blob>((resolve, reject) => {
    outCanvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('이미지 변환 실패')),
      'image/webp',
      OUTPUT_QUALITY,
    )
  })

  // 원본 파일명에서 확장자만 .webp로 교체
  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}
