import { useEffect, useState } from "react";

function detectBrowser() {
  const ua = navigator.userAgent;
  if (/Edg/i.test(ua)) return "edge";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "chrome";
  return "other";
}

export default function useNotificationStatus() {
  const [browser, setBrowser] = useState("other");
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    setBrowser(detectBrowser());
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Notifications are not supported in this browser.");
      return;
    }
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  return { browser, permission, requestPermission };
}
