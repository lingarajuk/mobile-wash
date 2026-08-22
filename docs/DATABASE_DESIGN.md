# Database Design & ERD Specification - Mobile Water Wash

## 1. Overview
The database uses **MySQL 8.0** with **SQLAlchemy 2.x** ORM for data persistence. All monetary fields use `DECIMAL(10, 2)` to prevent floating-point precision loss. Timestamps use `DATETIME` with UTC normalization.

---

## 2. Table Schemas & Indexes

### 2.1 `users`
- `id` (VARCHAR(36), PK): UUID string.
- `full_name` (VARCHAR(100)): User's complete name.
- `email` (VARCHAR(150), UNIQUE INDEX): Account login email.
- `phone` (VARCHAR(20), UNIQUE INDEX): Mobile contact number.
- `password_hash` (VARCHAR(255)): Bcrypt hashed password.
- `role` (ENUM('customer', 'employee', 'admin')): Role permission discriminator.
- `profile_image` (VARCHAR(500), NULLABLE): Avatar URL.
- `is_active` (BOOLEAN): Soft active state flag.
- `referral_code` (VARCHAR(20), UNIQUE INDEX): Referral code for customer referral rewards.
- `created_at` (DATETIME): Record creation timestamp.
- `updated_at` (DATETIME): Record update timestamp.

### 2.2 `employees`
- `id` (VARCHAR(36), PK): Employee unique string ID.
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, UNIQUE): 1-to-1 link with user profile.
- `designation` (VARCHAR(100)): Role title e.g. "Wash Specialist".
- `rating` (FLOAT): Average rating score (1.0 to 5.0).
- `completed_jobs` (INT): Total completed job count.
- `today_earnings` (DECIMAL(10, 2)): Daily accumulated earnings.
- `total_earnings` (DECIMAL(10, 2)): Lifetime total earnings.
- `status` (ENUM('Available', 'On Job', 'Offline')): Live availability state.
- `current_location` (VARCHAR(255)): Active city area.

### 2.3 `vehicles`
- `id` (VARCHAR(36), PK): Vehicle unique ID.
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX): Owner customer ID.
- `vehicle_type` (VARCHAR(50)): `bike` | `scooter` | `hatchback` | `sedan` | `suv` | `luxury`.
- `brand` (VARCHAR(50)): Vehicle brand e.g. "Honda".
- `model` (VARCHAR(50)): Vehicle model e.g. "City ZX".
- `registration_number` (VARCHAR(30)): License plate registration number.
- `color` (VARCHAR(30)): Body paint color.
- `is_default` (BOOLEAN): Default selected vehicle flag.

### 2.4 `addresses`
- `id` (VARCHAR(36), PK): Address unique ID.
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX): Owner customer ID.
- `label` (VARCHAR(30)): Address label e.g. "Home", "Office".
- `house` (VARCHAR(100)): Flat/House number.
- `street` (VARCHAR(150)): Street line.
- `area` (VARCHAR(100)): Area/Locality.
- `landmark` (VARCHAR(150), NULLABLE): Landmark.
- `city` (VARCHAR(50)): City name e.g. "Mysuru".
- `state` (VARCHAR(50)): State e.g. "Karnataka".
- `pincode` (VARCHAR(10)): Postal code.
- `is_default` (BOOLEAN): Default address flag.

### 2.5 `services`
- `id` (VARCHAR(36), PK): Service unique ID.
- `name` (VARCHAR(100)): Service title.
- `category` (VARCHAR(50), INDEX): Category filter tag.
- `price` (DECIMAL(10, 2)): Base price.
- `original_price` (DECIMAL(10, 2)): Original strike-through price.
- `duration_minutes` (INT): Estimated duration in minutes.
- `rating` (FLOAT): Rating score.
- `reviews_count` (INT): Total reviews count.
- `badge` (VARCHAR(50), NULLABLE): Badge tag e.g. "Popular", "Best Value".
- `image_url` (VARCHAR(500)): Cover image URL.
- `description` (TEXT): Service details prose.
- `included_json` (JSON): Bullet array of included features.
- `not_included_json` (JSON): Bullet array of excluded features.
- `recommended_vehicles_json` (JSON): Compatible vehicle categories.
- `is_active` (BOOLEAN): Active status flag.

### 2.6 `addons`
- `id` (VARCHAR(36), PK): Addon unique ID.
- `name` (VARCHAR(100)): Addon name e.g. "Tyre & Rim Polish".
- `price` (DECIMAL(10, 2)): Addon unit price.
- `icon` (VARCHAR(50)): Lucide icon identifier.
- `description` (TEXT): Brief addon description.
- `is_active` (BOOLEAN): Active flag.

### 2.7 `offers`
- `id` (VARCHAR(36), PK): Offer ID.
- `code` (VARCHAR(30), UNIQUE INDEX): Promo coupon code.
- `title` (VARCHAR(150)): Offer title.
- `description` (TEXT): Offer rules description.
- `discount_type` (ENUM('flat', 'percent')): Discount calculation type.
- `discount_value` (DECIMAL(10, 2)): Discount value or percentage rate.
- `minimum_order_amount` (DECIMAL(10, 2)): Minimum cart total required.
- `maximum_discount` (DECIMAL(10, 2), NULLABLE): Cap for percentage discounts.
- `expiry_date` (DATETIME, NULLABLE): Coupon expiry date.
- `category` (VARCHAR(50)): Offer category.
- `is_active` (BOOLEAN): Active state.

### 2.8 `bookings`
- `id` (VARCHAR(36), PK): Unique booking ID e.g. `AGW-84920`.
- `booking_number` (VARCHAR(50), UNIQUE INDEX): Unique booking reference number.
- `customer_id` (VARCHAR(36), FK -> `users.id`, INDEX): Customer user ID.
- `vehicle_id` (VARCHAR(36), FK -> `vehicles.id`): Vehicle ID.
- `service_id` (VARCHAR(36), FK -> `services.id`): Service ID.
- `address_id` (VARCHAR(36), FK -> `addresses.id`): Address ID.
- `employee_id` (VARCHAR(36), FK -> `employees.id`, NULLABLE, INDEX): Assigned technician ID.
- `scheduled_date` (DATE, INDEX): Scheduled wash date.
- `scheduled_time` (VARCHAR(50)): Slot time range.
- `status` (ENUM('Pending', 'Confirmed', 'Assigned', 'Accepted', 'On The Way', 'Arrived', 'In Progress', 'Completed', 'Cancelled'), INDEX): Workflow state.
- `progress_step` (INT): Current UI tracking progress step (0 to 4).
- `base_price` (DECIMAL(10, 2)): Service price at booking.
- `addon_amount` (DECIMAL(10, 2)): Total add-ons amount.
- `discount_amount` (DECIMAL(10, 2)): Calculated coupon discount amount.
- `tax_amount` (DECIMAL(10, 2)): Tax amount.
- `total_amount` (DECIMAL(10, 2)): Final bill amount.
- `coupon_code` (VARCHAR(30), NULLABLE): Coupon applied.
- `payment_method` (VARCHAR(50)): Payment mode.
- `payment_status` (ENUM('Pending', 'Paid', 'Failed', 'Refunded')): Payment status.

### 2.9 `booking_addons`
- `id` (INT, PK, AUTO_INCREMENT): Primary key.
- `booking_id` (VARCHAR(36), FK -> `bookings.id` ON DELETE CASCADE): Booking reference.
- `addon_id` (VARCHAR(36), FK -> `addons.id`): Addon reference.
- `price_at_booking` (DECIMAL(10, 2)): Frozen addon price.

### 2.10 `payments`
- `id` (VARCHAR(36), PK): Payment ID.
- `booking_id` (VARCHAR(36), FK -> `bookings.id` ON DELETE CASCADE, UNIQUE): Associated booking.
- `user_id` (VARCHAR(36), FK -> `users.id`): Customer user ID.
- `amount` (DECIMAL(10, 2)): Total payment transaction amount.
- `payment_method` (VARCHAR(50)): Payment mode e.g. "UPI (Google Pay)".
- `transaction_id` (VARCHAR(100), UNIQUE INDEX): Gateway transaction reference ID.
- `status` (ENUM('Pending', 'Paid', 'Failed', 'Refunded')): Transaction status.

### 2.11 `reviews`
- `id` (VARCHAR(36), PK): Review ID.
- `booking_id` (VARCHAR(36), FK -> `bookings.id` ON DELETE CASCADE, UNIQUE): Associated completed booking.
- `customer_id` (VARCHAR(36), FK -> `users.id`): Reviewer customer ID.
- `rating` (INT): Rating score from 1 to 5 stars.
- `comment` (TEXT, NULLABLE): Feedback review text.

### 2.12 `notifications`
- `id` (VARCHAR(36), PK): Notification ID.
- `user_id` (VARCHAR(36), FK -> `users.id` ON DELETE CASCADE, INDEX): Target recipient user ID.
- `title` (VARCHAR(150)): Notification title.
- `message` (TEXT): Notification message text.
- `type` (VARCHAR(50)): Notification category tag.
- `is_read` (BOOLEAN): Read indicator flag.

### 2.13 `business_settings`
- `id` (INT, PK): Fixed primary key = 1.
- `business_name` (VARCHAR(100)): Platform brand name.
- `tagline` (VARCHAR(255)): Platform tagline.
- `phone` (VARCHAR(30)): Hotline phone number.
- `email` (VARCHAR(100)): Official support email.
- `address` (TEXT): Headquarters address.
- `opening_time` (VARCHAR(20)): Business opening hours.
- `closing_time` (VARCHAR(20)): Business closing hours.
- `service_areas` (TEXT): Supported active service locations.
- `tax_percentage` (DECIMAL(5, 2)): Default GST/Tax rate %.
- `cancellation_rules` (TEXT): Standard cancellation policy text.
