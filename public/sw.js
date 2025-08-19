self.addEventListener("push", function (event) {
  const data = event.data.json();
  console.log("Push event received:", data);

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon.png",
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          // ✅ check if your app is already open
          if (
            client.url.startsWith(self.location.origin) &&
            "focus" in client
          ) {
            return client.focus();
          }
        }
        // ✅ otherwise open a new tab at your root
        if (self.clients.openWindow) {
          return self.clients.openWindow(self.location.origin + "/");
        }
      })
  );
});
