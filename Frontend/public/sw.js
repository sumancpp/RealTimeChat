self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Received...", data);
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/vite.svg"
    });
});

self.addEventListener("notificationclick", e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: "window" }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
