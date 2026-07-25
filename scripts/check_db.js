const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite3');

db.all("SELECT id, complaint_id, citizen_id, title FROM api_complaint", [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log("Complaints:", rows);
});

db.all("SELECT id, username, role FROM api_user", [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log("Users:", rows);
});
