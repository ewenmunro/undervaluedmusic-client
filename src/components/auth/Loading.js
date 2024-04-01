import { useEffect, useState } from "react";

function usePageLoading() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs when the component mounts
    const delay = 1000;

    setTimeout(() => {
      setLoading(false);
    }, delay);
  }, []);

  return isLoading;
}

export default usePageLoading;
