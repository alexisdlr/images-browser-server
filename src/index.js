import express from "express";
import webpush from "web-push";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Claves VAPID
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Clave pública:', vapidKeys.publicKey);
console.log('Clave privada:', vapidKeys.privateKey);

webpush.setVapidDetails(
  "mailto:alxsdlrdev3009@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Guardar suscripciones en memoria (para pruebas locales)
const subscriptions = [];

// Endpoint para suscripción
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log("suscription", subscription)
  res.status(201).json({mss: "Suscrito"});
});

app.post('/notify', async (req, res) => {
  const notificationPayload = {
    title: 'Notificación de prueba',
    body: '¡Esta es una notificación de prueba!',
    icon: '/icon.png',
  }

  try {
    await Promise.all(
      subscriptions.map(sub =>
        webpush.sendNotification(sub, JSON.stringify(notificationPayload))
      )
    );
    res.status(200).json({ message: 'Notificación enviada' });
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

// Enviar notificación
app.post("/send-notification", async (req, res) => {
  const { title, body } = req.body;

  const payload = JSON.stringify({
    title,
    body,
    icon: "/icon.png", // Cambia según tu icono
  });

  // Enviar notificaciones a todas las suscripciones registradas
  subscriptions.forEach((subscription) => {
    webpush.sendNotification(subscription, payload).then(() => {
      console.log('se enviaron')
    }).catch((error) => {
      console.error("Error al enviar la notificación:", error);
    });
  });

  res.status(200).json({ message: "Notificaciones enviadas." });
});

// Iniciar el servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
