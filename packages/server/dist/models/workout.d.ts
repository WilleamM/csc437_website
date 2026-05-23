export interface Workout {
    id: string;
    name: string;
    date: string;
    duration: number;
    plan: string;
    exercises: Array<Exercise>;
}
export interface Exercise {
    name: string;
    href: string;
    muscles: string;
    equipment: string;
}
