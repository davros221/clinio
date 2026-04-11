import { useMemo } from "react";

type CoordinateProps = {
  lon: number;
  lat: number;
  address?: never;
};

type AddressProps = {
  address: string;
  lon?: never;
  lat?: never;
};

type Props = (CoordinateProps | AddressProps) & {
  title?: string;
  zoom?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_ZOOM = 15;

export function MapPreview({
  title = "map-preview",
  zoom = DEFAULT_ZOOM,
  width = "100%",
  height = 200,
  className,
  style,
  ...location
}: Props) {
  const src = useMemo(() => {
    if ("address" in location && location.address) {
      const query = encodeURIComponent(location.address);
      return `https://frame.mapy.cz/zakladni?q=${query}&z=${zoom}`;
    }
    if ("lon" in location && location.lon != null && location.lat != null) {
      const { lon, lat } = location;
      return `https://frame.mapy.cz/zakladni?x=${lon}&y=${lat}&z=${zoom}&source=coor&id=${lon},${lat}`;
    }
    return null;
  }, [location, zoom]);

  if (!src) return null;

  return (
    <iframe
      title={title}
      src={src}
      width={width}
      height={height}
      className={className}
      style={{ border: 0, ...style }}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
