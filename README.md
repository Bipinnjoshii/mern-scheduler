# 🖥️ SCHED — CPU Scheduling Algorithm Simulator

> **A full-stack MERN app that simulates CPU scheduling algorithms with a real ML-powered burst time predictor.**

Built with **React + Vite**, **Express + Node.js**, **MongoDB**, and a **Python/scikit-learn microservice** — a genuine polyglot architecture where Node delegates ML work to a dedicated Python service over REST.

---

## ✨ Features

- 🔁 **4 scheduling algorithms** — FCFS, SJF, SRTF, and Round Robin
- 📊 **Gantt chart visualization** — interactive timeline of process execution
- 📈 **Metrics table** — completion time, turnaround time, waiting time per process + averages
- 🤖 **ML burst time predictor** — predict a process's next burst using linear regression on its history
- 💾 **Persistent history** — save/load/delete past simulation runs via MongoDB
- 🧪 **Real train/test evaluation** — MSE reported when enough data points exist
- ⚡ **Hotkey-customizable** — rebind any algorithm shortcut from the UI

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Browser (React + Vite)             │
│    ProcessForm │ AlgorithmPicker │ GanttChart        │
│    MetricsTable │ BurstPredictor │ History           │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP /api/*
                       ▼
┌─────────────────────────────────────────────────────┐
│            Express Server (Node.js) :5000           │
│   /api/simulations   →  simulationController.js     │
│   /api/predict       →  predictController.js        │
│                             │                       │
│                    axios HTTP call                  │
│                             ▼                       │
│         Python Flask ML Service :8000               │
│         POST /predict  (scikit-learn LinearReg)     │
└──────────────┬──────────────────────────────────────┘
               │  mongoose
               ▼
┌─────────────────────────────────────────────────────┐
│              MongoDB                                │
│   simulations collection  │  bursthistories         │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
mern-scheduler/
├── client/                      # React (Vite) frontend
│   ├── index.html
│   ├── vite.config.js           # Proxies /api/* → localhost:5000
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js               # All fetch calls in one place
│       ├── index.css
│       └── components/
│           ├── AlgorithmPicker.jsx   # FCFS / SJF / SRTF / RR selector
│           ├── ProcessForm.jsx       # Add/edit processes
│           ├── GanttChart.jsx        # Timeline visualization
│           ├── MetricsTable.jsx      # Per-process stats + averages
│           ├── BurstPredictor.jsx    # ML prediction UI
│           └── History.jsx           # Saved runs list
│
├── server/                      # Express + MongoDB backend
│   ├── server.js                # Entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js                # Mongoose connection
│   ├── models/
│   │   ├── Simulation.js        # Mongoose schema for simulation runs
│   │   └── BurstHistory.js      # Mongoose schema for ML history
│   ├── controllers/
│   │   ├── simulationController.js  # Run / save / fetch / delete sims
│   │   └── predictController.js     # Calls Python service + logs to DB
│   ├── routes/
│   │   ├── simulations.js
│   │   └── predict.js
│   └── lib/
│       └── scheduling.js        # All 4 scheduling algorithm implementations
│
└── ml-service/                  # Python Flask + scikit-learn
    ├── app.py                   # POST /predict, GET /health
    └── requirements.txt
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Python | 3.9+ |
| MongoDB | Local (`mongodb://127.0.0.1:27017`) or Atlas URI |

---

### 1️⃣ Backend (Express API)

```bash
cd server
npm install
cp .env.example .env        # Edit MONGO_URI if using MongoDB Atlas
npm run dev                 # Starts on http://localhost:5000
```

---

### 2️⃣ ML Microservice (Python/Flask)

Open a **second terminal**:

```bash
cd ml-service

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py               # Starts on http://localhost:8000
```

Leave this terminal open — the Express server calls it via HTTP.

---

### 3️⃣ Frontend (React + Vite)

Open a **third terminal**:

```bash
cd client
npm install
npm run dev                 # Starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser. Vite proxies `/api/*` → `localhost:5000` automatically.

---

## 🧠 Algorithms Implemented

All algorithms live in [`server/lib/scheduling.js`](server/lib/scheduling.js) and return a unified shape:

```js
{
  timeline: [{ pid, start, end }],    // Gantt chart segments
  metrics:  [{ pid, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime }],
  averages: { avgWaitingTime, avgTurnaroundTime }
}
```

| Algorithm | Type | How it works |
|-----------|------|-------------|
| **FCFS** | Non-preemptive | Sorted by arrival time, runs to completion in order |
| **SJF** | Non-preemptive | Picks the shortest burst among all arrived processes |
| **SRTF** | Preemptive | Re-evaluates shortest remaining time every tick |
| **Round Robin** | Preemptive | Fixed time quantum, configurable per run |

---

## 🤖 ML Burst Time Predictor

The Python microservice predicts how long a process will run next based on its past burst-time history — mirroring a real OS problem (SJF/SRTF need to know burst time in advance, but a real OS has to predict it).

### How it works

```
Past burst times: [5, 7, 6, 8, 7, 9]
       │
       ▼
X = [0, 1, 2, 3, 4, 5]  (time index)
y = [5, 7, 6, 8, 7, 9]  (burst time at that index)
       │
       ▼
sklearn LinearRegression.fit(X, y)
       │
       ▼
Predict at X = 6  →  ~9.6 (clamped to ≥ 1.0)
```

- **Train/test split**: when 4+ history points exist, the last point is held out as a test set and **MSE** is reported — a real evaluation, not just a fitted line
- **Result**: `predictedBurstTime`, `slope`, `intercept`, `mse`, `pointsUsed`

### Using it in the app

1. Open the **"Burst Time Predictor"** panel in the sidebar
2. Enter a process label (e.g. `Compiler`)
3. Enter comma-separated past burst times (e.g. `5, 7, 6, 8, 7`)
4. Click **Predict Next Burst Time**
5. Click **"+ Add as process to queue"** to drop it straight into your process list
6. Run any algorithm against it like a normal process

Every prediction is logged to MongoDB (`bursthistories` collection).

**Data pipeline:**
```
MongoDB (history) → Python (prediction) → Express (orchestration) → React (display)
```

---

## 📡 REST API Reference

### Simulations

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/simulations/run` | Compute schedule, don't save |
| `POST` | `/api/simulations` | Compute and persist a run |
| `GET` | `/api/simulations` | List saved runs (newest first) |
| `GET` | `/api/simulations/:id` | Fetch one saved run |
| `DELETE` | `/api/simulations/:id` | Delete a saved run |

**Request body for `run` / create:**
```json
{
  "algorithm": "RR",
  "quantum": 2,
  "processes": [
    { "pid": "P1", "arrivalTime": 0, "burstTime": 5, "color": "#F2A65A" },
    { "pid": "P2", "arrivalTime": 2, "burstTime": 3, "color": "#6BCB77" }
  ]
}
```

### Burst Prediction

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/predict` | Predict next burst time (calls Python ML service) |
| `GET` | `/api/predict/history` | List saved burst-time history records |
| `DELETE` | `/api/predict/history/:id` | Delete a history record |

**Request body for `/api/predict`:**
```json
{
  "processLabel": "Compiler",
  "history": [5, 7, 6, 8, 7, 9]
}
```

---

## 🔧 Environment Variables

Create `server/.env` from `server/.env.example`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/scheduler   # or your Atlas URI
PORT=5000
ML_SERVICE_URL=http://localhost:8000
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Axios |
| Backend | Node.js 18, Express 4, Mongoose 8 |
| Database | MongoDB |
| ML Service | Python 3, Flask, scikit-learn, NumPy |
| Dev Tools | Nodemon, Vite HMR |

---

## 📝 Notes

- `/api/simulations/run` works even without MongoDB running (compute-only, no save)
- If the Python ML service is down, `/api/predict` returns a clear error instead of crashing the backend
- The ML service uses a genuine **polyglot microservice pattern** — Express doesn't do any ML itself, it delegates to Python over HTTP

---

## 🤝 Contributing

Ideas welcome! Some things to explore:

- [ ] Priority scheduling algorithm
- [ ] Multiple CPU / multi-core simulation
- [ ] More ML models (exponential moving average, LSTM)
- [ ] Real-time Gantt animation
- [ ] Docker Compose setup for one-command startup

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  Built with ❤️ using the MERN stack + Python ML
  <br/>
  <sub>If this was useful, consider giving it a ⭐</sub>
</div>
