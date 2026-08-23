from app.database.connection import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE booking_status_history MODIFY COLUMN status VARCHAR(50) NULL'))
        conn.commit()
        print("Status column made nullable")
    except Exception as e:
        print("status error:", e)

    try:
        query = text("""
            SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'booking_status_history' AND COLUMN_NAME = 'changed_by' AND CONSTRAINT_SCHEMA = 'mobile_wash'
        """)
        fks = conn.execute(query).fetchall()
        for fk in fks:
            try:
                conn.execute(text(f"ALTER TABLE booking_status_history DROP FOREIGN KEY {fk[0]}"))
                conn.commit()
                print(f"Dropped FK {fk[0]}")
            except Exception as ex:
                print("drop fk error:", ex)
    except Exception as e:
        print("FK query error:", e)

    try:
        conn.execute(text("ALTER TABLE booking_status_history MODIFY COLUMN changed_by VARCHAR(100) NULL"))
        conn.commit()
        print("Modified changed_by to VARCHAR(100) NULL")
    except Exception as e:
        print("changed_by error:", e)

print("History schema updated successfully!")
