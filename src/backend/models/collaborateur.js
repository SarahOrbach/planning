const db = require('../util/database');

module.exports = class Collaborateur {
    constructor(name, user, firstName, lastName, idEnt, mail, phone, teams, hours, days) {
        this.name = name;
        this.user = user;
        this.firstName = firstName;
        this.lastName = lastName;
        this.idEnt = idEnt;
        this.mail = mail;
        this.phone = phone;
        this.teams = teams;
        this.hours = hours;
        this.days = days;
    }

    static fetchAll(userID) {
        return db.execute('SELECT * FROM collaborateurs WHERE user = ?', [userID]);
    }

    static fetch(userID, collaborateursID) {
        return db.execute('SELECT * FROM collaborateurs WHERE user = ? && id = ?', [userID, collaborateursID]);
    }

    static find(id) {
        return db.execute('SELECT name FROM collaborateurs WHERE id = ?', [id]);
    }

    static save(collaborateur) {
        return db.execute(
            'INSERT INTO collaborateurs (name, user, firstName, lastName, idEnt, mail, phone, teams, hours, days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [collaborateur.name, collaborateur.user, collaborateur.firstName, collaborateur.lastName, collaborateur.idEnt, collaborateur.mail, collaborateur.phone, collaborateur.teams, collaborateur.hours, collaborateur.days]
        )
    }

    static update(collaborateur) {
        return db.execute(
            'UPDATE collaborateurs SET name = ? , user = ? , firstName = ? , lastName = ? , idEnt = ? , mail = ? , phone = ? , teams = ? , hours = ? , days = ? WHERE id = ?', 
            [collaborateur.name, collaborateur.user, collaborateur.firstName, collaborateur.lastName, collaborateur.idEnt, collaborateur.mail, collaborateur.phone, collaborateur.teams, collaborateur.hours, collaborateur.days, collaborateur.id]
        )
    }

    static updateEq(collaborateur) {
        console.log('update eq fonction');
        return db.execute(
            'UPDATE collaborateurs SET teams = ? WHERE id = ?', 
            [collaborateur.teams, collaborateur.id]
        )
    }
    

    static delete(id) {
        return db.execute('DELETE FROM collaborateurs WHERE id = ?', [id]);
    }
};