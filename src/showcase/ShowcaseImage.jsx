import { useState } from "react";

/** Remote image over a gradient that shows through if the image fails to load. */
export default function ShowcaseImage({ src, gradient, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="absolute inset-0 block overflow-hidden">
      <span
        className="absolute inset-0 block"
        style={{ backgroundImage: gradient }}
      />
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${className}`}
        />
      )}
    </span>
  );
}
