# School Parent App

A comprehensive React Native mobile application for parents to monitor their child's school activities, manage fees, and communicate with the school.

## 🚀 Features

### Core
- **Multi-Child Dashboard**: Switch between profiles for multiple children.
- **Authentication**: Secure login with OTP verification.
- **Profile Management**: Manage parent and child details.

### Monitoring
- **Attendance**: Visualization of present, absent, and late days.
- **Performance**: Subject-wise exam results and progress tracking.

### Academic
- **Homework**: Track pending and marked-as-done assignments.
- **Timetable**: Weekly class schedule view.
- **Syllabus**: Curriculum progress tracking (Completed/In-Progress).

### Administrative
- **Fee Management**: View invoices and simulate fee payments.
- **Leave Applications**: Apply for leave and track status.
- **Transport**: Live bus tracking with driver details (Mocked).

## 🛠 Architecture

The project follows a **Service-Oriented Architecture** for better scalability and testing.

- **`/app`**: UI Screens (Expo Router).
- **`/components`**: Reusable UI components.
- **`/services`**: API logic and mock adapters.
    - `api.client.ts`: Central Axios client.
    - `student.service.ts`: Child data operations.
    - `academic.service.ts`: Homework, Timetable, Syllabus.
    - `admin.service.ts`: Fees, Leave, Transport.
- **`/context`**: Global state (Auth).
- **`/types`**: TypeScript interfaces.

### Backend Mocking
The application is currently running with a **Mock Adapter** (`axios-mock-adapter`). All data is simulated locally in the `services` files.
- **No real server is required** to run the app.
- To connect to a real backend, simply update `API_URL` in `services/api.client.ts` and remove the mock adapter.

## 📦 Setup & Run

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Supabase**
    - Create a project on [Supabase](https://supabase.com).
    - Copy `.env.example` to `.env` (or create one):
      ```properties
      EXPO_PUBLIC_SUPABASE_URL=your_project_url
      EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
      ```
    - Run the SQL from `supabase_schema.sql` in your Supabase SQL Editor to create tables.

3.  **Start Application**
    ```bash
    npx expo start
    ```

4.  **Login**
    - Use a real phone number (OTP will be sent via Supabase Auth) or set up "Test Phone Numbers" in Supabase to skip SMS.

## 📱 Tech Stack
- **Framework**: React Native (Expo)
- **Routing**: Expo Router
- **Networking**: Axios
- **Styling**: StyleSheet (Standard)
- **Icons**: Ionicons
