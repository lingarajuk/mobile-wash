import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, date
from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models import (
    User, UserRole, Employee, EmployeeStatus, Vehicle, Address,
    Service, Addon, Offer, DiscountType, Booking, BookingStatus,
    PaymentStatus, BookingAddon, Payment, Notification, BusinessSettings
)

def seed():
    print("--- Initializing MySQL Database Schema & Seeding Initial Development Data ---")
    
    # Create tables if not present
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if users already seeded
        if db.query(User).first():
            print("Database already contains seeded data. Skipping seed execution.")
            return

        print("1. Seeding Users & Employees...")
        admin = User(
            id="admin-001",
            full_name="Admin Supervisor",
            email="admin@aquago.com",
            phone="+91 99000 11223",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            referral_code="ADMIN001"
        )
        db.add(admin)

        emp_user_1 = User(
            id="user-emp-201",
            full_name="Venkatesh Kumar",
            email="venky@aquago.com",
            phone="+91 91234 56789",
            password_hash=get_password_hash("employee123"),
            role=UserRole.EMPLOYEE,
            profile_image="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80"
        )
        db.add(emp_user_1)
        
        emp_profile_1 = Employee(
            id="emp-201",
            user_id="user-emp-201",
            designation="Senior Detailing Technician",
            rating=4.9,
            completed_jobs=184,
            today_earnings=1450.00,
            total_earnings=38200.00,
            status=EmployeeStatus.AVAILABLE,
            current_location="Saraswathipuram, Mysuru"
        )
        db.add(emp_profile_1)

        emp_user_2 = User(
            id="user-emp-202",
            full_name="Suresh Gowda",
            email="suresh@aquago.com",
            phone="+91 98877 66554",
            password_hash=get_password_hash("employee123"),
            role=UserRole.EMPLOYEE,
            profile_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
        )
        db.add(emp_user_2)

        emp_profile_2 = Employee(
            id="emp-202",
            user_id="user-emp-202",
            designation="Wash Specialist",
            rating=4.8,
            completed_jobs=142,
            today_earnings=950.00,
            total_earnings=24100.00,
            status=EmployeeStatus.AVAILABLE,
            current_location="Vijayanagar, Mysuru"
        )
        db.add(emp_profile_2)

        customer = User(
            id="cust-101",
            full_name="Rahul Sharma",
            email="rahul.sharma@example.com",
            phone="+91 98765 43210",
            password_hash=get_password_hash("customer123"),
            role=UserRole.CUSTOMER,
            referral_code="RAHUL884",
            profile_image="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
        )
        db.add(customer)

        print("2. Seeding Services & Addons...")
        s1 = Service(
            id="srv-1",
            name="Basic Exterior Wash",
            category="hatchback",
            price=349.00,
            original_price=449.00,
            duration_minutes=35,
            rating=4.8,
            reviews_count=142,
            badge="Popular",
            image_url="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80",
            description="High-pressure foam wash for exterior paint, window cleaning, and wheel rim wiping.",
            included_json=[
                "High-pressure eco-water rinse",
                "pH-neutral snow foam shampoo",
                "Tire & wheel rim pressure cleaning",
                "Exterior microfiber towel dry",
                "Windshield & mirror streak-free wiping"
            ],
            not_included_json=[
                "Interior vacuum cleaning",
                "Dashboard dressing & polish",
                "Underbody jet wash",
                "Engine bay cleaning"
            ],
            recommended_vehicles_json=["Hatchback", "Sedan", "SUV"]
        )
        db.add(s1)

        s2 = Service(
            id="srv-2",
            name="Premium Doorstep Wash",
            category="sedan",
            price=599.00,
            original_price=799.00,
            duration_minutes=55,
            rating=4.9,
            reviews_count=289,
            badge="Best Value",
            image_url="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80",
            description="Complete exterior foam wash plus deep interior vacuuming and dashboard shine polish.",
            included_json=[
                "Everything in Basic Exterior Wash",
                "Deep interior cabin vacuuming (Seats & Carpet)",
                "Dashboard & door trims UV polish & conditioning",
                "Tire shine spray dressing",
                "Footmat wash & stain removal",
                "Air freshener spray application"
            ],
            not_included_json=[
                "Seat upholstery deep shampoo extraction",
                "Hard wax body coating"
            ],
            recommended_vehicles_json=["Hatchback", "Sedan", "SUV", "Luxury"]
        )
        db.add(s2)

        s3 = Service(
            id="srv-3",
            name="Interior Spa & Sanitization",
            category="suv",
            price=799.00,
            original_price=1099.00,
            duration_minutes=60,
            rating=4.9,
            reviews_count=96,
            badge="Hygiene Special",
            image_url="https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80",
            description="Deep interior shampooing, stain extraction, AC vent steam sanitization, and leather polish.",
            included_json=[
                "Full cabin high-power vacuuming",
                "Fabric seat dry foam shampooing",
                "Leather seat cleaning & nourishing conditioner",
                "AC vent anti-bacterial steam cleaning",
                "Roof lining spot cleaning",
                "Odor eliminator treatment"
            ],
            not_included_json=["Exterior foam body wash"],
            recommended_vehicles_json=["Sedan", "SUV", "Luxury"]
        )
        db.add(s3)

        s4 = Service(
            id="srv-4",
            name="Full Interior + Exterior Combo",
            category="sedan",
            price=999.00,
            original_price=1399.00,
            duration_minutes=90,
            rating=5.0,
            reviews_count=340,
            badge="Recommended",
            image_url="https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&w=600&q=80",
            description="The ultimate package: Complete exterior wash with hard wax shine + deep interior spa treatment.",
            included_json=[
                "Complete Premium Exterior Snow Wash",
                "Body Gloss Hard Wax Polish application",
                "Deep Interior Upholstery Shampooing",
                "Engine Bay degreasing & shine dressing",
                "AC Vent antibacterial steam cleaning",
                "Tire gloss & Alloy wheel rim detailing"
            ],
            not_included_json=[],
            recommended_vehicles_json=["All Cars", "Luxury Vehicles"]
        )
        db.add(s4)

        s5 = Service(
            id="srv-5",
            name="Pro Bike & Scooter Foam Wash",
            category="bike",
            price=199.00,
            original_price=299.00,
            duration_minutes=25,
            rating=4.8,
            reviews_count=215,
            badge="Quick Wash",
            image_url="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
            description="Gentle high-pressure foam wash, chain degreasing, engine area wiping, and body shine coat.",
            included_json=[
                "High-pressure water rinse",
                "Ph-balanced foam wash",
                "Chain degreasing & lubricant spray",
                "Tire wall dress shine",
                "Seat polish & drying"
            ],
            not_included_json=["Engine oil change", "Polishing compound buffing"],
            recommended_vehicles_json=["Bike", "Scooter"]
        )
        db.add(s5)

        # Addons
        add1 = Addon(id="addon-1", name="Tyre & Rim Polish", price=99.00, icon="Disc", description="Deep black wet gloss tire shine spray")
        add2 = Addon(id="addon-2", name="Dashboard UV Shield Polish", price=149.00, icon="Shield", description="Prevents cracking & gives rich satin finish")
        add3 = Addon(id="addon-3", name="High-Power Interior Vacuum", price=199.00, icon="Wind", description="Removes deep dust, pet hair & sand")
        add4 = Addon(id="addon-4", name="AC Vent Steam Sanitization", price=249.00, icon="Flame", description="Kills 99.9% germs and odor bacteria")
        add5 = Addon(id="addon-5", name="Carnuba Body Wax Coating", price=349.00, icon="Sparkles", description="Hydrophobic protective shine layer")
        db.add_all([add1, add2, add3, add4, add5])

        print("3. Seeding Offers & Coupons...")
        o1 = Offer(
            id="off-1",
            code="FIRSTWASH",
            title="Welcome First Wash Offer",
            description="Get flat ₹150 discount on your very first doorstep vehicle wash experience.",
            discount_type=DiscountType.FLAT,
            discount_value=150.00,
            minimum_order_amount=300.00,
            category="Welcome"
        )
        o2 = Offer(
            id="off-2",
            code="SAVE10",
            title="10% OFF Special Discount",
            description="Get 10% OFF on orders above ₹400",
            discount_type=DiscountType.PERCENT,
            discount_value=10.00,
            minimum_order_amount=400.00,
            maximum_discount=200.00,
            category="Discount"
        )
        o3 = Offer(
            id="off-3",
            code="WEEKEND20",
            title="Weekend Special Offer",
            description="20% OFF Special Weekend Discount on all bookings",
            discount_type=DiscountType.PERCENT,
            discount_value=20.00,
            minimum_order_amount=600.00,
            maximum_discount=300.00,
            category="Weekend"
        )
        db.add_all([o1, o2, o3])

        print("4. Seeding Customer Vehicles & Addresses...")
        v1 = Vehicle(
            id="veh-1",
            user_id="cust-101",
            vehicle_type="sedan",
            brand="Honda",
            model="City ZX",
            registration_number="KA-09-MA-7821",
            color="Platinum White",
            is_default=True
        )
        v2 = Vehicle(
            id="veh-2",
            user_id="cust-101",
            vehicle_type="bike",
            brand="Royal Enfield",
            model="Classic 350",
            registration_number="KA-09-EV-3490",
            color="Stealth Black",
            is_default=False
        )
        db.add_all([v1, v2])

        a1 = Address(
            id="addr-1",
            user_id="cust-101",
            label="Home",
            house="No. 42, 3rd Main Road",
            street="Gokulam 2nd Stage",
            area="Vijayanagar",
            landmark="Near Water Tank",
            city="Mysuru",
            state="Karnataka",
            pincode="570002",
            is_default=True
        )
        a2 = Address(
            id="addr-2",
            user_id="cust-101",
            label="Office",
            house="Suite 304, Tech Park",
            street="Hebbal Industrial Area",
            area="Hebbal",
            landmark="Opposite Infosys Campus",
            city="Mysuru",
            state="Karnataka",
            pincode="570016",
            is_default=False
        )
        db.add_all([a1, a2])

        print("5. Seeding Sample Bookings & Business Settings...")
        b1 = Booking(
            id="AGW-84920",
            booking_number="AGW-84920",
            customer_id="cust-101",
            vehicle_id="veh-1",
            service_id="srv-2",
            address_id="addr-1",
            employee_id="emp-201",
            scheduled_date=date(2026, 8, 7),
            scheduled_time="09:00 AM – 10:00 AM",
            status=BookingStatus.ON_THE_WAY,
            progress_step=2,
            base_price=599.00,
            addon_amount=248.00,
            discount_amount=150.00,
            tax_amount=125.00,
            total_amount=697.00,
            coupon_code="FIRSTWASH",
            payment_method="UPI (Google Pay)",
            payment_status=PaymentStatus.SUCCESS
        )
        db.add(b1)

        b_add1 = BookingAddon(booking_id="AGW-84920", addon_id="addon-1", price_at_booking=99.00)
        b_add2 = BookingAddon(booking_id="AGW-84920", addon_id="addon-2", price_at_booking=149.00)
        db.add_all([b_add1, b_add2])

        p1 = Payment(
            id="pay-84920",
            booking_id="AGW-84920",
            user_id="cust-101",
            amount=697.00,
            payment_method="UPI (Google Pay)",
            transaction_id="TXN-98124501",
            status=PaymentStatus.SUCCESS
        )
        db.add(p1)

        n1 = Notification(
            id="notif-1",
            user_id="cust-101",
            title="Professional On The Way",
            message="Venkatesh is driving towards your location (Vijayanagar, Mysuru). ETA: 15 mins.",
            type="booking",
            is_read=False
        )
        db.add(n1)

        settings = BusinessSettings(
            id=1,
            business_name="AquaGo Wash",
            tagline="Professional Vehicle Care at Your Doorstep",
            phone="+91 800-AQUAGO (278246)",
            email="support@aquago.com",
            address="102 Waterworks Blvd, Gokulam 3rd Stage, Mysuru, Karnataka 570002",
            opening_time="07:00 AM",
            closing_time="08:00 PM",
            service_areas="Mysuru City, Hebbal, Vijayanagar, Kuvempunagar, Saraswathipuram",
            tax_percentage=18.00,
            cancellation_rules="Free cancellation up to 2 hours before scheduled slot. 20% fee thereafter."
        )
        db.add(settings)

        db.commit()
        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
