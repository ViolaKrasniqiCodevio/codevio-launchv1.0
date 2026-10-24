import { useState } from 'react';

export default function SafeImage({
  src,
  alt = '',
  className = '',
  fallbackClassName = '',
  ...props
}) {
  // Remember which src failed instead of a bare boolean: a changed `src`
  // no longer matches and the image gets a fresh attempt, so a re-pointed
  // image is not stuck showing the fallback.
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className={
          fallbackClassName ||
          `bg-[linear-gradient(135deg,#1a1a2e_0%,#7b2233_55%,#db364e_100%)] ${className}`.trim()
        }
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
      {...props}
    />
  );
}
