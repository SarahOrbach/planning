const db = require('../util/database');

module.exports = class User {
    constructor(name, password, firstname, lastname, company, mail, phone, postal, city) {
        this.name = name;
        this.password = password;
        this.firstname = firstname,
        this.lastname = lastname,
        this.company = company;
        this.mail = mail;
        this.phone = phone;
        this.postal = postal;
        this.city = city;
    }

    static find(name) {
        return db.execute('SELECT * FROM user WHERE name = ?', [name]);
    }

    static save(user) {
        console.log('save', user);
        return db.execute(
            'INSERT INTO user (name, password, firstname, lastname, company, mail, phone, postal, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [user.name, user.password, user.firstname, user.lastname, user.company, user.mail, user.phone, user.postal, user.city]
        )
    }
};
