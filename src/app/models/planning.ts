export interface Planning {
    date: Date;
    user: number;
    equipeId: number;
    locked: boolean;
    collaborateurId: number;
    creneau: string[];
}