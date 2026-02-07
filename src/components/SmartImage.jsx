import React, { useEffect, useMemo, useState } from "react";
import { getFirebaseImageUrl, getImageUrl, handleImageError } from "../utils/imageUtils";

export default function SmartImage({
  path,
  size,
  alt,
  className,
  onError,
  ...props
}) {
  const [resolvedSrc, setResolvedSrc] = useState("");

  const isFirebasePath = useMemo(() => {
    if (!path || typeof path !== "string") return false;
    return (
      path.startsWith("gs://") ||
      path.startsWith("movies/") ||
      path.startsWith("/movies/") ||
      path.startsWith("users/") ||
      path.startsWith("/users/")
    );
  }, [path]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!path) {
        setResolvedSrc(getImageUrl(path, size, alt || "Image"));
        return;
      }

      if (!isFirebasePath) {
        setResolvedSrc(getImageUrl(path, size, alt || "Image"));
        return;
      }

      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      const url = await getFirebaseImageUrl(cleanPath);
      if (!cancelled) {
        setResolvedSrc(url || getImageUrl(null, size));
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [path, size, isFirebasePath]);

  const safeSrc = resolvedSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  return (
    <img
      src={safeSrc}
      alt={alt || ""}
      className={className}
      onError={(e) => {
        if (typeof onError === "function") onError(e);
        handleImageError(e, alt);
      }}
      {...props}
    />
  );
}
