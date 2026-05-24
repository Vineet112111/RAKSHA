# RAKSHA (रक्षा) — System & Feature Documentation

Welcome to the complete system documentation for **RAKSHA**, India's futuristic women safety command center web application. This documentation covers all available features, their current working status, how they operate under the hood, and how to use them.

---

## 📋 System Architecture Overview
- **Backend**: Node.js, Express, Socket.io (WebSockets), Zod (Validation), JWT (Authentication), Mongoose.
- **Database**: MongoDB Atlas (Cloud Database).
- **Frontend**: React, Vite, TailwindCSS (for sleek HUD styling), Framer Motion (for cybernetic micro-animations), HTML5 Geolocation API, Socket.io-client.

---

## 🛠️ Feature Index

### 1. Secure Access / User Authentication
* **Status**: 🟢 **Fully Functional (Active)**
* **Under the Hood**:
  - Uses JWT (JSON Web Tokens) to secure user sessions.
  - Validates client requests with **Zod** schemas.
  - Hashes passwords using **bcryptjs** before storage.
  - Backend routes:
    - `POST /api/auth/register` (Registers a new user and returns a token)
    - `POST /api/auth/login` (Authenticates a user by email or phone)
    - `GET /api/auth/me` (Fetches authenticated user details)
* **How to Use**:
  1. Click **SECURE ACCESS** in the top navigation bar.
  2. Switch between **Register** or **Login** forms.
  3. Enter email, phone, name, and password.
  4. Once signed in, the top navbar will show your name in brackets: `[YOUR_NAME]`.

---

### 2. SOS Command Beacon
* **Status**: 🟢 **Fully Functional (Active)**
* **Under the Hood**:
  - Uses the browser's **HTML5 Geolocation API** to fetch the client's current coordinates. If coordinates are blocked or time out, it automatically falls back to simulated Mumbai coordinates (`19.0760° N, 72.8777° E`).
  - Calls `POST /api/sos/trigger` to register an active incident in MongoDB Atlas with a unique random ID (e.g. `SOS-7E93B2`).
  - Opens a **WebSocket connection** to the backend, automatically joining a room matching the pattern `sos-<sosId>`.
  - Initiates a background broadcast interval that streams current GPS coordinates to the Socket.io room every **5 seconds**. If simulated, the script applies minor random drifts to mimic walking in real-time.
  - Cancelling the SOS or marking yourself safe emits a `sos-ended` event to the socket room and updates the active MongoDB status to `cancelled` or `safe`.
* **How to Use**:
  1. Navigate to the **SOS COMMAND** section on the main page.
  2. Click the large red glowing **SOS** button.
  3. A 3-second countdown will start (you can click **Cancel** during countdown).
  4. Once the beacon starts transmitting, you will see `BEACON ACTIVE` with your active **Room ID**.
  5. Click **I'M SAFE** or **CANCEL ALERT** to turn off the beacon and notify all dispatchers.

---

### 3. Live Location Grid / Telemetry Map
* **Status**: 🟢 **Fully Functional (Active)**
* **Under the Hood**:
  - Renders a custom-drawn canvas representing the Maharashtra state border and local safe zones.
  - When you enter an active SOS ID, the client connects to the victim's Socket.io room (`sos-<sosId>`) using the `joinTrackingRoom` method.
  - Listens for `receive-location` socket messages, and appends incoming coordinates to a local tracking breadcrumbs path.
  - Draws a blinking target and line trail of coordinates in real-time directly on the canvas map.
  - Listens for `sos-ended` to automatically terminate the tracking link.
* **How to Use**:
  1. Go to the **LIVE LOCATION GRID** section.
  2. Copy an active **Room ID** (from an active SOS screen).
  3. Paste the ID into the "TELEMETRY CONTROLLER" input box and click **ESTABLISH TELEMETRY LINK**.
  4. The canvas map will center on the target, rendering a blinking target crosshair and tracking trail that updates in real-time as the victim's location updates.
  5. Click **DISCONNECT LINK** to stop tracking manually.

---

### 4. Emergency Contacts Manager (Shield)
* **Status**: 🟢 **Fully Functional (Active)**
* **Under the Hood**:
  - Restricts access to logged-in users.
  - Limits contacts to a maximum of 5.
  - Backend routes:
    - `GET /api/contacts` (Fetches contacts belonging to the logged-in user)
    - `POST /api/contacts` (Adds a contact)
    - `PUT /api/contacts/:id` (Updates contact details)
    - `DELETE /api/contacts/:id` (Removes contact)
* **How to Use**:
  1. Log in via **SECURE ACCESS**.
  2. Scroll down to the **LIVE DASHBOARD** section.
  3. Under the "EMERGENCY CONTACTS (MAX 5)" card, you will find the contact registry.
  4. Type a responder's Name, Phone number, and Relation (e.g., Mom), and click **REGISTER RESPONDER**.
  5. Use **[EDIT]** or **[DELETE]** actions next to any registered responder to make modifications.

---

### 5. Decoy Fake Call System
* **Status**: 🟡 **Simulated UI (Frontend-Only)**
* **Under the Hood**:
  - Operates purely on React state hooks and CSS animations.
  - Simulates phone calling behavior with ringing and vibration frames.
  - Displays a visual waveform canvas when connected, simulating active audio communication.
* **How to Use**:
  1. Scroll to the **FAKE CALL** section.
  2. Select one of the caller presets: **Mom (आई)**, **Boss**, **Police**, or **Office**.
  3. The simulator will delay for 3 seconds, then show an incoming calling interface.
  4. Press the green **Call** button to accept and view the waveform simulation, or press the red **End Call** button to close.

---

### 6. Tactical Navigation / Safe Walk Mode
* **Status**: 🟡 **Simulated UI (Frontend-Only)**
* **Under the Hood**:
  - Implements a local interval timer counting down from 7 minutes.
  - Simulates active route checkpoints (Start Point ➔ Checkpoint Alpha ➔ Checkpoint Beta ➔ Safe Zone Gate ➔ Destination) in Maharashtra.
  - Renders a scanning threat radar canvas displaying simulated entities.
* **How to Use**:
  1. Scroll down to the **SAFE WALK MODE** section.
  2. View checkpoints, ETA timer progression, and nearby secure safe house distances.

---

### 7. AI Guardian Engine
* **Status**: 🟡 **Simulated UI (Frontend-Only)**
* **Under the Hood**:
  - Renders a continuous, interactive neural net particle animation on a canvas.
  - Simulates static calculations (Danger Score of 12%, confidence rate of 99.7%, and list of nearby units).
* **How to Use**:
  1. Scroll down to the **AI GUARDIAN** section to view metrics and threat definitions.

---

## 🧪 Inactive Components (Available but Unrendered)
The following components are present in the frontend source code at `raksha-frontend/src/components/sections/` but are **not currently rendered** on the main dashboard. You can enable them by importing and adding them to [App.jsx](file:///c:/Users/ASUS/Desktop/Hackathon/RAKSHA-/raksha-frontend/src/App.jsx).

1. **Voice Command Engine** (`VoiceCommandSection.jsx`):
   - *Status*: Simulated UI.
   - *Action*: Simulates listening for keywords like `"RAKSHA, HELP ME"` or `"MUJHE DARR LAG RAHA HAI"`. It visualizes microphone inputs and triggers a mock silent SOS response.
2. **Threat Heatmap** (`ThreatHeatmapSection.jsx`):
   - *Status*: Simulated UI.
   - *Action*: Renders a canvas displaying crime density overlays in cities (red for high, orange for medium, blue for low risk) along with prediction indexes.
3. **Evidence Locker** (`EvidenceLockerSection.jsx`):
   - *Status*: Simulated UI.
   - *Action*: Mockup that simulates blockchain-verified evidence collection (audio recordings, photo signatures, and GPS trail proofs).
