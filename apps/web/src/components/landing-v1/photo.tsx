import { classNames } from "./class-names";

export interface PhotoProps {
  /** Базовое имя файла в /images/photos (без -ширина.webp). */
  name: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Оптимизированное фото: pre-sized WebP + srcset. Без next/image, чтобы
 * не зависеть от sharp и не платить за рантайм-оптимизацию.
 */
export function Photo({
  name,
  widths,
  width,
  height,
  alt,
  sizes,
  priority = false,
  className,
}: PhotoProps) {
  const max = widths[widths.length - 1] ?? width;
  return (
    <img
      src={`/images/photos/${name}-${max}.webp`}
      srcSet={widths.map((w) => `/images/photos/${name}-${w}.webp ${w}w`).join(", ")}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={classNames("h-full w-full object-cover", className)}
    />
  );
}
