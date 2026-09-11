import type { CSSProperties, ImgHTMLAttributes } from "react"

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
}

export default function Image({
  fill = false,
  priority = false,
  alt,
  style,
  ...props
}: ImageProps) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : style

  return (
    <img
      {...props}
      alt={alt}
      {...(priority ? { fetchpriority: "high" } : {})}
      style={fillStyle}
      loading={priority ? "eager" : props.loading}
    />
  )
}
