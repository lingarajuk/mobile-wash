import os
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import text
from app.database.connection import engine

def migrate_v2():
    print("Running database migration v2...")
    with engine.begin() as conn:
        # 1. Update bookings table columns
        booking_cols = [
            ("transaction_id", "VARCHAR(100) NULL"),
            ("inspection_notes", "TEXT NULL"),
            ("scratches_dents_notes", "TEXT NULL"),
            ("estimated_duration", "VARCHAR(50) NULL DEFAULT '45 mins'")
        ]
        for col_name, col_type in booking_cols:
            try:
                conn.execute(text(f"ALTER TABLE bookings ADD COLUMN {col_name} {col_type}"))
                print(f"Added column bookings.{col_name}")
            except Exception as e:
                print(f"Column bookings.{col_name} already exists or error: {e}")

        # 2. Update booking_photos table to ensure employee_id exists
        try:
            conn.execute(text("ALTER TABLE booking_photos ADD COLUMN employee_id VARCHAR(50) NULL"))
            print("Added column booking_photos.employee_id")
        except Exception as e:
            print(f"Column booking_photos.employee_id already exists or error: {e}")

        try:
            conn.execute(text("ALTER TABLE booking_photos MODIFY COLUMN photo_type VARCHAR(50) NOT NULL"))
            print("Updated booking_photos.photo_type to VARCHAR(50)")
        except Exception as e:
            print(f"Modify booking_photos.photo_type error: {e}")

        # 3. Create booking_status_history table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS booking_status_history (
                id VARCHAR(50) PRIMARY KEY,
                booking_id VARCHAR(50) NOT NULL,
                previous_status VARCHAR(50) NULL,
                new_status VARCHAR(50) NOT NULL,
                changed_by VARCHAR(100) NULL,
                changed_by_role VARCHAR(50) NULL,
                note TEXT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_bsh_booking (booking_id),
                INDEX idx_bsh_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        print("Ensured booking_status_history table exists.")

        # 4. Create booking_locations (live tracking) table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS booking_locations (
                id VARCHAR(50) PRIMARY KEY,
                booking_id VARCHAR(50) NOT NULL,
                employee_id VARCHAR(50) NULL,
                latitude FLOAT NOT NULL,
                longitude FLOAT NOT NULL,
                speed FLOAT NULL,
                heading FLOAT NULL,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_bl_booking (booking_id),
                INDEX idx_bl_emp (employee_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        print("Ensured booking_locations table exists.")

        # 5. Create vehicle_inspections table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS vehicle_inspections (
                id VARCHAR(50) PRIMARY KEY,
                booking_id VARCHAR(50) NOT NULL,
                exterior_condition VARCHAR(100) NULL,
                interior_condition VARCHAR(100) NULL,
                existing_scratches TEXT NULL,
                dents_notes TEXT NULL,
                broken_parts TEXT NULL,
                dirty_areas TEXT NULL,
                inspection_notes TEXT NULL,
                inspected_by VARCHAR(100) NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_vi_booking (booking_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        print("Ensured vehicle_inspections table exists.")

        # 6. Create reviews table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reviews (
                id VARCHAR(50) PRIMARY KEY,
                booking_id VARCHAR(50) NOT NULL UNIQUE,
                customer_id VARCHAR(50) NULL,
                employee_id VARCHAR(50) NULL,
                rating INT NOT NULL DEFAULT 5,
                comment TEXT NULL,
                service_quality_rating INT NULL DEFAULT 5,
                technician_rating INT NULL DEFAULT 5,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_rev_booking (booking_id),
                INDEX idx_rev_cust (customer_id),
                INDEX idx_rev_emp (employee_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        print("Ensured reviews table exists.")

    print("Migration v2 completed successfully!")

if __name__ == "__main__":
    migrate_v2()
