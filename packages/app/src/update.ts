import { Message } from "@unbndl/service";
import { Auth } from "@unbndl/auth";
import { ThenUpdate } from "@unbndl/store";
import { Workout, Exercise } from "server/models";
import { Model } from "./model.ts";
import { Msg } from "./messages.ts";

export type Cmd =
  | ["workouts/load", { workouts: Workout[] }]
  | ["exercises/load", { exercises: Exercise[] }]
  | ["workout/load", { workout: Workout }]
  | ["workout/created", { workout: Workout }];

export function update(
  model: Readonly<Model>,
  message: Msg | Cmd,
  user: Auth.Model
): Model | ThenUpdate<Model, Cmd> {
  const [type, payload] = message;
  switch (type) {
    case "workouts/request": {
      return [model, requestWorkouts(user)];
    }
    case "exercises/request": {
      return [model, requestExercises(user)];
    }
    case "exercises/load": {
      const { exercises } = payload as { exercises: Exercise[] };
      return { ...model, exercises };
    }
    case "workouts/load": {
      const { workouts } = payload as { workouts: Workout[] };
      return { ...model, workouts };
    }
    case "workout/request": {
      const { id } = payload as { id: string };
      if (model.workout?.id === id) break;
      return [
        { ...model, workout: undefined },
        requestWorkout({ id }, user)
      ];
    }
    case "workout/load": {
      const { workout } = payload as { workout: Workout };
      return { ...model, workout };
    }
    case "workout/save": {
      const p = payload as { id: string; workout: Workout };
      return [model, saveWorkout(p, user)];
    }
    case "workout/create": {
      const p = payload as { workout: Workout };
      return [model, createWorkout(p, user)];
    }
    case "workout/created": {
      const { workout } = payload as { workout: Workout };
      const workouts = [...(model.workouts || []), workout];
      return { ...model, workouts };
    }
    default: {
      const unhandled: never = type;
      throw new Error(`Unhandled message "${unhandled}"`);
    }
  }
  return model;
}

function requestWorkouts(user: Auth.Model) {
  return fetch("/api/workouts", {
    headers: Auth.headers(user) as Record<string, string>
  })
    .then((response: Response) => {
      if (response.status === 200) return response.json();
      throw "No Response from server";
    })
    .then((json: unknown) => {
      if (json) return [
        "workouts/load",
        { workouts: json as Workout[] }
      ] as Cmd;
      throw "No JSON in response from server";
    });
}

function requestExercises(user: Auth.Model) {
  return fetch("/api/exercises", {
    headers: Auth.headers(user) as Record<string, string>
  })
    .then((response: Response) => {
      if (response.status === 200) return response.json();
      throw "No Response from server";
    })
    .then((json: unknown) => {
      if (json) return [
        "exercises/load",
        { exercises: json as Exercise[] }
      ] as Cmd;
      throw "No JSON in response from server";
    });
}

function requestWorkout(
  payload: { id: string },
  user: Auth.Model
) {
  return fetch(`/api/workouts/${payload.id}`, {
    headers: Auth.headers(user) as Record<string, string>
  })
    .then((response: Response) => {
      if (response.status === 200) return response.json();
      throw "No Response from server";
    })
    .then((json: unknown) => {
      if (json) return [
        "workout/load",
        { workout: json as Workout }
      ] as Cmd;
      throw "No JSON in response from server";
    });
}

function createWorkout(
  payload: { workout: Workout },
  user: Auth.Model
): Promise<Cmd> {
  return fetch("/api/workouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user) as Record<string, string>
    },
    body: JSON.stringify(payload.workout)
  })
    .then((res: Response) => {
      if (res.status === 201) return res.json();
      throw new Error(`${res.status} status creating workout`);
    })
    .then((json: unknown) => {
      if (json) return [
        "workout/created",
        { workout: json as Workout }
      ] as Cmd;
      throw new Error("No JSON in API response");
    })
    .catch((err) => {
      console.log("Error creating workout:", err);
      throw err;
    });
}

function saveWorkout(
  payload: { id: string; workout: Workout },
  user: Auth.Model
): Promise<Cmd> {
  return fetch(`/api/workouts/${payload.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...Auth.headers(user) as Record<string, string>
    },
    body: JSON.stringify(payload.workout)
  })
    .then((res: Response) => {
      if (res.status === 200) return res.json();
      throw new Error(`${res.status} status; saving workout ${payload.id}`);
    })
    .then((json: unknown) => {
      if (json) return [
        "workout/load",
        { workout: json as Workout }
      ] as Cmd;
      throw new Error("No JSON in API response");
    })
    .catch((err) => {
      console.log("Error saving workout:", err);
      throw err;
    });
}
