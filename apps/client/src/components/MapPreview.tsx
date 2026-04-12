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
  const address = "address" in location ? location.address : undefined;
  const lon = "lon" in location ? location.lon : undefined;
  const lat = "lat" in location ? location.lat : undefined;

  const src = useMemo(() => {
    if (address) {
      const query = encodeURIComponent(address);
      return `https://frame.mapy.cz/zakladni?q=${query}&z=${zoom}`;
    }
    if (lon != null && lat != null) {
      return `https://frame.mapy.cz/zakladni?x=${lon}&y=${lat}&z=${zoom}&source=coor&id=${lon},${lat}`;
    }
    return null;
  }, [address, lon, lat, zoom]);

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
