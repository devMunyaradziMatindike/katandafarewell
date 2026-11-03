import Image from "next/image";

const TILES = [
  {
    src: "/images/katanda-fan-1.jpeg",
    alt: "Mr Thompson Katanda at a Salvation Army gathering",
    className: "fan-tile fan-tile-1",
    objectPosition: "center 20%",
  },
  {
    src: "/images/katanda-fan-2.jpeg",
    alt: "Mr Thompson Katanda at an outdoor event",
    className: "fan-tile fan-tile-2",
    objectPosition: "center 15%",
  },
  {
    src: "/images/katanda-fan-3.jpeg",
    alt: "Mr Thompson Katanda in Victoria Falls",
    className: "fan-tile fan-tile-3",
    objectPosition: "center 12%",
  },
  {
    src: "/images/katanda-fan-4.jpeg",
    alt: "Mr Thompson Katanda with Mazowe High School Tribune",
    className: "fan-tile fan-tile-4",
    objectPosition: "center 10%",
  },
] as const;

export function ImageFan() {
  return (
    <div className="image-fan fade-up-delay">
      {TILES.map((tile) => (
        <div key={tile.src} className={tile.className}>
          <Image
            src={tile.src}
            alt={tile.alt}
            fill
            sizes="168px"
            className="object-cover"
            style={{ objectPosition: tile.objectPosition }}
            priority
          />
        </div>
      ))}
    </div>
  );
}
