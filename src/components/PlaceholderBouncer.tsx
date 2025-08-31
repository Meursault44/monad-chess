import { useEffect, useRef, useState, memo } from 'react';
import { Box, HStack, Text, Button } from '@chakra-ui/react';

type PlaceholderBouncerProps = {
  logoSrc?: string; // путь к логотипу (png/svg)
  bg?: string; // фон страницы
  speed?: number; // пикс/кадр (реальная скорость зависит от DPR и rAF)
  size?: number; // ширина логотипа в px (высота авто)
  showHUD?: boolean; // панель справа снизу (FPS, corner hits)
};

export const PlaceholderBouncer = memo(function PlaceholderBouncer({
  logoSrc = '/Egg.png',
  bg = '#0B0B12',
  speed = 3,
  size = 140,
  showHUD = true,
}: PlaceholderBouncerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const vxRef = useRef(speed);
  const vyRef = useRef(speed * 0.85); // чуть несимметрично приятнее
  const xRef = useRef(60);
  const yRef = useRef(60);

  const [cornerHits, setCornerHits] = useState(0);
  const cornerHitsRef = useRef(0);

  const [fps, setFps] = useState(0);
  const lastFpsRef = useRef(performance.now());
  const framesRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoSrc;
    imgRef.current = img;

    let cw = 0;
    let ch = 0;

    // размеры логотипа (будут заданы после загрузки)
    let w = size * dpr;
    let h = size * dpr;

    img.onload = () => {
      const aspect = img.naturalHeight / img.naturalWidth; // 529 / 429 ≈ 1.23
      w = size * dpr;
      h = w * aspect; // сохранить пропорцию
      resize();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cw = Math.floor(rect.width * dpr);
      ch = Math.floor(rect.height * dpr);
      canvas.width = cw;
      canvas.height = ch;

      // не дать лого вывалиться
      xRef.current = Math.min(xRef.current, Math.max(0, cw - w));
      yRef.current = Math.min(yRef.current, Math.max(0, ch - h));
    };

    const onResize = () => resize();
    resize();
    window.addEventListener('resize', onResize);

    let last = performance.now();

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = Math.min(40, now - last); // clamp 25fps min
      last = now;

      // FPS расчет
      framesRef.current += 1;
      if (now - lastFpsRef.current >= 500) {
        setFps(Math.round((framesRef.current * 1000) / (now - lastFpsRef.current)));
        framesRef.current = 0;
        lastFpsRef.current = now;
      }

      // движение
      let x = xRef.current + vxRef.current * (dt / (1000 / 60));
      let y = yRef.current + vyRef.current * (dt / (1000 / 60));

      // столкновения
      let hitX = false;
      let hitY = false;

      if (x <= 0) {
        x = 0;
        vxRef.current = Math.abs(vxRef.current);
        hitX = true;
      }
      if (x + w >= cw) {
        x = cw - w;
        vxRef.current = -Math.abs(vxRef.current);
        hitX = true;
      }
      if (y <= 0) {
        y = 0;
        vyRef.current = Math.abs(vyRef.current);
        hitY = true;
      }
      if (y + h >= ch) {
        y = ch - h;
        vyRef.current = -Math.abs(vyRef.current);
        hitY = true;
      }

      // «попадание в угол» — когда одновременно было отражение по X и Y
      if (hitX && hitY) {
        cornerHitsRef.current += 1;
        setCornerHits(cornerHitsRef.current);
      }

      xRef.current = x;
      yRef.current = y;

      // Рисуем
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);

      // подсветка при близости к углу
      const nearCorner =
        (x < 8 * dpr && y < 8 * dpr) ||
        (x < 8 * dpr && y + h > ch - 8 * dpr) ||
        (x + w > cw - 8 * dpr && y < 8 * dpr) ||
        (x + w > cw - 8 * dpr && y + h > ch - 8 * dpr);

      if (nearCorner) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(131,110,249,0.25)'; // фиолетовая «аура»
        ctx.beginPath();
        ctx.roundRect(x - 12 * dpr, y - 12 * dpr, w + 24 * dpr, h + 24 * dpr, 20 * dpr);
        ctx.fill();
        ctx.restore();
      }

      if (imgRef.current && imgRef.current.complete) {
        // лёгкий scale при ударе
        const s = hitX || hitY ? 1.06 : 1.0;
        const sw = w * s;
        const sh = h * s;
        const dx = x + (w - sw) / 2;
        const dy = y + (h - sh) / 2;
        ctx.drawImage(imgRef.current, dx, dy, sw, sh);
      } else {
        // резерв: белая «табличка», если логотип ещё грузится
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, w, h);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [logoSrc, bg, speed, size]);

  return (
    <Box position="relative" w="100%" h="calc(100vh - 64px)" bg={bg}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        aria-label="Loading screen animation"
      />
      {showHUD && (
        <HStack
          position="absolute"
          right="16px"
          bottom="16px"
          gap="3"
          bg="rgba(255,255,255,0.06)"
          backdropFilter="blur(6px)"
          border="1px solid rgba(255,255,255,0.1)"
          borderRadius="lg"
          px="3"
          py="2"
        >
          <Text color="whiteAlpha.800" fontSize="sm">
            FPS: {fps}
          </Text>
          <Text color="whiteAlpha.800" fontSize="sm">
            Corners: {cornerHits}
          </Text>
          <Button
            size="xs"
            onClick={() => {
              setCornerHits(0); /* только UI, счётчик внутри тоже сбросим */
            }}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          >
            Reset
          </Button>
        </HStack>
      )}
    </Box>
  );
});
