import { Workout } from "server/models";

export type Msg =
  | ["workouts/request", {}]
  | ["exercises/request", {}]
  | ["workout/request", { id: string }]
  | [
      "workout/save",
      { id: string; workout: Workout },
      {
        onSuccess?: () => void;
        onFailure?: (err: Error) => void;
      }
    ]
  | [
      "workout/create",
      { workout: Workout },
      {
        onSuccess?: () => void;
        onFailure?: (err: Error) => void;
      }
    ];
