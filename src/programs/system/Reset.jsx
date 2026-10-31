import { useEffect } from "react";

export default function Reset() {
  useEffect(() => {
    fs.clear().then(location.reload());
  }, []);
}
