import sqlite3

conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()

# Drop old inconsistent tables so migrations can recreate them correctly
tables_to_drop = [
    'api_passwordresettoken',
]
for t in tables_to_drop:
    try:
        cur.execute(f'DROP TABLE IF EXISTS "{t}"')
        print(f"Dropped: {t}")
    except Exception as e:
        print(f"Error dropping {t}: {e}")

# Remove the faked 0002 migration record so it runs for real
cur.execute("DELETE FROM django_migrations WHERE app='api' AND name='0002_user_is_verified_otprecord_passwordresettoken'")
print(f"Removed migration record, rows affected: {cur.rowcount}")

conn.commit()
conn.close()
print("Done.")
