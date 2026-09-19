import { useState, useEffect, useRef, useCallback } from "react";

const useInfiniteScroll = (callback, hasMore) => {
  const observerRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);

  const lastElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setIsFetching(true);
          callback();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetching, hasMore, callback],
  );

  useEffect(() => {
    if (!isFetching) return;
    setIsFetching(false);
  }, [isFetching]);

  return lastElementRef;
};

export default useInfiniteScroll;
