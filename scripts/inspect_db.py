import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print("Tables:", tables)
for t in tables:
    name = t[0]
    if 'otp' in name.lower() or 'password' in name.lower():
        cur.execute(f"PRAGMA table_info({name})")
        print(f"\n{name}:", cur.fetchall())
conn.close()
