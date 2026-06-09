export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  plan: string;
  exercises: Array<Exercise>;
  updatedAt?: string;
}

export interface Exercise {
  name: string;
  href: string;
  muscles: string;
  equipment: string;
  sets?: number;
  reps?: number;
}
