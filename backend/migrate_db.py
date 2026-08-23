import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine
from sqlalchemy import text, inspect

def run_migration():
    print("Running database update script...")
    inspector = inspect(engine)
    existing_cols = [c['name'] for c in inspector.get_columns('bookings')]
    print(f"Existing columns in bookings: {existing_cols}")

    with engine.begin() as conn:
        # Modify status column to VARCHAR(50)
        try:
            conn.execute(text("ALTER TABLE bookings MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending Verification'"))
            print("Updated status column to VARCHAR(50)")
        except Exception as e:
            print("Status modify warning:", e)

        try:
            conn.execute(text("ALTER TABLE bookings MODIFY COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending'"))
            print("Updated payment_status column to VARCHAR(50)")
        except Exception as e:
            print("payment_status modify warning:", e)

        try:
            conn.execute(text("ALTER TABLE payments MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending'"))
            print("Updated payments.status column to VARCHAR(50)")
        except Exception as e:
            print("payments.status modify warning:", e)

        # Missing columns
        target_cols = [
            ('customer_name', 'VARCHAR(100) NULL'),
            ('customer_phone', 'VARCHAR(30) NULL'),
            ('customer_email', 'VARCHAR(100) NULL'),
            ('vehicle_condition', 'VARCHAR(100) NULL'),
            ('condition_notes', 'TEXT NULL'),
            ('special_instructions', 'TEXT NULL'),
            ('rejection_reason', 'TEXT NULL')
        ]

        for col_name, col_type in target_cols:
            if col_name not in existing_cols:
                try:
                    conn.execute(text(f"ALTER TABLE bookings ADD COLUMN {col_name} {col_type}"))
                    print(f"Added column {col_name}")
                except Exception as ex:
                    print(f"Error adding {col_name}:", ex)
            else:
                print(f"Column {col_name} already exists.")

    print("Migration finished successfully!")

if __name__ == "__main__":
    run_migration()
