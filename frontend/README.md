# 🛰️ SatelliteOps — Satellite Telemetry and Data-Priority Dashboard

## About the Project

SatelliteOps is a web-based satellite telemetry monitoring and intelligent data-prioritization system developed using React.js, Java Spring Boot, and MongoDB.

The project aims to improve satellite data transmission management by monitoring satellite parameters, evaluating transmission priorities, organizing pending data, and maintaining historical records.

SatelliteOps uses a rule-based intelligent prioritization approach to determine the importance of satellite data based on battery level, communication link quality, and payload type.

The system provides an interactive dashboard for monitoring telemetry, evaluating priorities, managing transmission queues, and analyzing satellite operations.

## Features

- Satellite telemetry management
- Intelligent priority evaluation
- Priority-based transmission queue
- Transmission and decision history
- Analytics dashboard with charts
- Light and Dark Mode

## Technologies Used

- **Frontend:** React.js, Vite, CSS
- **Backend:** Java, Spring Boot
- **Database:** MongoDB
- **Visualization:** Recharts
- **Communication:** REST APIs

## How to Run

**1. Start MongoDB**

Ensure the MongoDB service is running.

**2. Start Backend**

Open the backend directory and run:

```powershell
.\mvnw.cmd spring-boot:run
```

**3. Start Frontend**

Open the frontend directory and run:

```bash
npm install
npm run dev
```

**4. Open Application**

http://localhost:5173

## Future Scope

- Real-time satellite telemetry monitoring
- Critical battery and link quality alerts
- Machine learning-based priority prediction
- Ground station communication scheduling

## Conclusion

SatelliteOps provides a centralized platform for monitoring satellite conditions, prioritizing important data, and managing transmission records efficiently.

**Note:** This project is an academic prototype that simulates satellite transmission management.