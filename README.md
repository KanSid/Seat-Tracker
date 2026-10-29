<<<<<<< HEAD
# Smart Library Seat Dashboard

A mobile-friendly Next.js dashboard for three library seats. Vercel hosts the app; Firebase Realtime Database streams the current seat states to every open browser.

## Local setup

1. Create a Firebase project and a Realtime Database.
2. Register a Firebase Web app and copy its configuration into `.env.local`, using the keys listed in `.env.example`.
3. Apply `database.rules.json` to the Realtime Database.
4. Start the app with `npm run dev`.

The dashboard subscribes to `/seats/seat1` through `/seats/seat3`. It reads the sensor fields and maps `status: "OCCUPIED"` to occupied and `status: "EMPTY"` to available:

```json
{ "distanceCm": 37, "motion": false, "status": "OCCUPIED" }
```

The dashboard also accepts the normalized `{ "state": "occupied" }` format. A seat without a recognized status is shown as unreported.

## Publish to Vercel

Import this project into Vercel. Add the five `NEXT_PUBLIC_FIREBASE_*` settings from `.env.example` under Project Settings → Environment Variables, then redeploy. The deployed Vercel URL is the public link to open from phones.

Firebase web configuration is public by design. The included database rules allow public reads of seat status and restrict writes to authenticated identities with the `sensor: true` custom claim. Provision this claim only for trusted sensor writers; never put a service-account key or database secret in the website or ESP32 firmware.
=======
# Seat-Tracker
>>>>>>> 0dc64c44f8cc09950e19a3d15f1f24a21ff0b803
