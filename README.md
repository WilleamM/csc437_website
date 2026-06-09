# Workout Tracker

A full-stack single-page application for tracking workouts, built for CSC 437.

## Running on the VPS

### 1. Clone and install
```bash
git clone https://github.com/WilleamM/csc437_website.git
cd csc437_website
npm install
```

### 2. Create the `.env` file
Create `packages/server/.env` with the following (fill in your values):
```
MONGO_USER=<username>
MONGO_PWD=<password>
MONGO_CLUSTER=<cluster>.mongodb.net
TOKEN_SECRET=<any long random string>
PORT=<your assigned port>
```

### 3. Build the client
```bash
npm run build -w packages/app
```

### 4. Start the server
```bash
npm run start:app -w packages/server
```

This compiles the TypeScript server and serves the built client from `packages/app/dist`.

---

## Using the App

- Visit the deployed URL and you will be redirected to the login page
- Click **"Register as a new user"** to create an account
- After logging in you will see your workout list
- Click a workout to view its exercises, sets, and reps
- Click **"Edit Workout"** to update details or add exercises from the exercise picker
- Use **"+ New Workout"** on the home page to create a new workout
