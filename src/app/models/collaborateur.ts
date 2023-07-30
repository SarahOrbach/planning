export interface Collaborateur {
    id: number;
    name: string;
    user: string;
    firstName?: string;
    lastName?: string;
    idEnt?: string;
    mail?: string;
    phone?: string;
    teams?: Array<string>;
    hours?: number;
    days?: number;
}