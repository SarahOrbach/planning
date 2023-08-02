export interface Equipe {
    id: number;
    name: string;
    user: string;
    creneauHours?: Array<string>;
    creneauText?: Array<string>;
    collaborateursId?: Array<string>;
    list2?: Array<string>;
    list3?: Array<string>;
    contraintesC?: string; // contraintes du collaborateur
    contraintesH?: string; // contraintes sur les heures
}