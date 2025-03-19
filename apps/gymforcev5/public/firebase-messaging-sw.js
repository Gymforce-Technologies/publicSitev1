importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzaoCUBy2i-isTz-KCXZRtYvba6DzJddQ",
  authDomain: "gymforce-e2476.firebaseapp.com",
  projectId: "gymforce-e2476",
  storageBucket: "gymforce-e2476.appspot.com",
  messagingSenderId: "299717931162",
  appId: "1:299717931162:web:13d86f5c6a7e43a45e6f23",
  measurementId: "G-SJP816SN0X",
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Track processed message IDs
const processedMessageIds = new Set();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[Firebase SW] Background message received:", payload);

  // Generate a unique ID for this message
  const messageId = payload.messageId || Date.now().toString();

  // Skip if already processed
  if (processedMessageIds.has(messageId)) {
    console.log(`[Firebase SW] Skipping duplicate message: ${messageId}`);
    return;
  }

  // Mark as processed
  processedMessageIds.add(messageId);

  // Cleanup old IDs (optional)
  if (processedMessageIds.size > 50) {
    const idsArray = Array.from(processedMessageIds);
    for (let i = 0; i < idsArray.length - 50; i++) {
      processedMessageIds.delete(idsArray[i]);
    }
  }

  // Create notification data
  const notification = {
    id: messageId,
    message: payload.notification?.body || "New Notification",
    created_at: new Date().toISOString(),
    unRead: true,
  };

  // Check if any clients are active
  self.clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((clients) => {
      if (clients.length > 0) {
        // App is open - send to client
        clients.forEach((client) => {
          client.postMessage({
            type: "NEW_NOTIFICATION",
            notification: notification,
            source: "service-worker",
          });
        });
      } else {
        // App is closed - show system notification
        const notificationTitle = payload.notification?.title || "New Message";
        const notificationOptions = {
          body: payload.notification?.body || "New Notification",
          icon: "/icon.png",
          data: {
            notificationData: notification,
          },
        };

        // Store in local storage for when app opens
        self.registration.showNotification(
          notificationTitle,
          notificationOptions
        );
      }
    });
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Get the notification data
  const notificationData = event.notification.data.notificationData;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        if (clients.length > 0) {
          // App is open - focus and pass notification
          clients[0].focus();
          clients[0].postMessage({
            type: "NOTIFICATION_CLICK",
            notification: notificationData,
          });
        } else {
          // App is closed - store notification and open app
          // Use IndexedDB to store the notification
          self.registration.index
            .getAll()
            .then((records) => {
              // Handle notification when app opens
              const url = "/";
              self.clients.openWindow(url);
            })
            .catch((err) => {
              console.error("Failed to store notification:", err);
              self.clients.openWindow("/");
            });
        }
      })
  );
});
