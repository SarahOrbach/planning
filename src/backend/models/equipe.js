const db = require('../util/database');

module.exports = class Equipe {
    constructor(name, user, creneauHours, creneauText, collaborateursId, list2, list3, contraintesC, contraintesH, resume) {
        this.name = name;
        this.user = user;
        this.creneauHours = creneauHours;
        this.creneauText = creneauText;
        this.collaborateursId = collaborateursId;
        this.list2 = list2;
        this.list3 = list3;
        this.contraintesC = contraintesC;
        this.contraintesH = contraintesH;
        this.resume = resume;
    }

    static fetchAll(userID) {
        return db.execute('SELECT * FROM equipe WHERE user = ?', [userID]);
    }

    static fetch(userID, equipeID) {
        return db.execute('SELECT * FROM equipe WHERE user = ? && id = ?', [userID, equipeID]);
    }

    static find(id) {
        return db.execute('SELECT name FROM equipe WHERE id = ?', [id]);
    }

    static save(equipe) {
        console.log('try saving')
        return db.execute(
            'INSERT INTO equipe (name, user, creneauHours, creneauText, collaborateursId, list2, list3, contraintesC, contraintesH, resume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [equipe.name, equipe.user, equipe.creneauHours, equipe.creneauText, equipe.collaborateursId, equipe.list2, equipe.list3, equipe.contraintesC, equipe.contraintesH, equipe.resume]
        )
    }

    static update(equipe) {
        //console.log('equipe', equipe);
        console.log('try update')
        return db.execute(
            'UPDATE equipe SET name = ?, user = ?, creneauHours = ?, creneauText = ?, collaborateursId = ?, list2 = ?, list3 = ?, contraintesC = ?, contraintesH = ?, resume = ? WHERE id = ?', 
            [equipe.name, equipe.user, equipe.creneauHours, equipe.creneauText, equipe.collaborateursId, equipe.list2, equipe.list3, equipe.contraintesC, equipe.contraintesH, equipe.resume, equipe.id]
        )
    }

    static updateCollab(equipe) {
        //console.log('equipe', equipe);
        console.log('try update')
        return db.execute(
            'UPDATE equipe SET collaborateursId = ? WHERE id = ?', 
            [equipe.collaborateursId, equipe.id]
        )
    }

    static delete(id) {
        return db.execute('DELETE FROM equipe WHERE id = ?', [id]);
    }
};