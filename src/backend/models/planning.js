const db = require('../util/database');

module.exports = class Planning {
    constructor(date, user, equipeId, locked, collaborateurId, creneau) {
        this.date = date;
        this.user= user;
        this.equipeId = equipeId;
        this.locked = locked;
        this.collaborateurId = collaborateurId;
        this.creneau = creneau;
    }

   /* static fetchAll(userID) {
        return db.execute('SELECT * FROM planning WHERE user = ?', [userID]);
    }

    static fetch(userID, equipeID) {
        return db.execute('SELECT * FROM planning WHERE user = ? && equipeId = ?', [userID, equipeID]);
    }*/

    static find(date, userID, equipeID, collaborateurID) {
        console.log('find function', date, userID, equipeID, collaborateurID);
        return db.execute('SELECT * FROM planning WHERE date = ? && user = ? && equipeId = ? && collaborateurId = ?', [date, userID, equipeID, collaborateurID]);
    }

    static save(planning) {
       // console.log('try saving date', planning.date, planning.user, planning.equipeId, planning.locked, planning.collaborateurId, planning.creneau);
        return db.execute(
            'INSERT INTO planning (date, user, equipeId, locked, collaborateurId, creneau) VALUES (?, ?, ?, ?, ?, ?)', 
            [planning.date, planning.user, planning.equipeId, planning.locked, planning.collaborateurId, planning.creneau]
        );
    }

    static update(planning) {
        console.log('update func');
        return db.execute(
            'UPDATE planning SET locked = ?, creneau = ? WHERE  id = ?', 
            [ planning.locked, planning.creneau, planning.id]
        )
    }

    static delete(equipeId) {
        return db.execute('DELETE FROM planning WHERE equipeId = ?', [equipeId]);
    }
};