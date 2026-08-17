# Khata

A simple offline business ledger app:

- Add your items with prices (price list)
- Add customers from your phone contacts or manually
- Build a slip by tapping items and quantities — saved as "udhar" against that customer
- Record payments received to reduce the balance
- Share the slip as an image via WhatsApp (or any app) using the phone's normal share sheet
- Send an SMS reminder using your own phone's SIM/SMS balance (no extra service, no internet needed)
- All data stored locally on the device (SQLite) — works fully offline

## Run for testing (Expo Go)

```
npm install
npx expo start
```
Scan the QR code with the Expo Go app on your phone.

Note: expo-sqlite, expo-contacts and expo-sms need a native build to work fully —
Expo Go covers most of it, but for full contacts/SMS reliability use a standalone
build (see below).

## Build a real installable app

```
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```
This gives a direct .apk download link to install on your phone.

## Notes

- No cloud sync — data lives only on the device it's installed on. If you need
  it on multiple phones or want a backup, that's a separate feature to add.
- SMS is sent through the device's own default SMS app (uses your own SIM
  balance), not any bulk SMS service.
