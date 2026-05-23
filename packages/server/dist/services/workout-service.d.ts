import { Workout } from "../models/index.ts";
declare function index(): Promise<Workout[]>;
declare function get(id: string): Promise<Workout | undefined>;
declare function create(json: Workout): Promise<Workout>;
declare function update(id: string, workout: Workout): Promise<Workout | undefined>;
declare function remove(id: string): Promise<void>;
declare const _default: {
    index: typeof index;
    get: typeof get;
    create: typeof create;
    update: typeof update;
    remove: typeof remove;
};
export default _default;
