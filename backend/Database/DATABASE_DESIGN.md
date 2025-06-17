# Database Design - Academic Organizer

## 🔍 Overview
We're using a PostgreSQL database with 3 main models:
- Users
- Assignments
- Notes

These are connected using basic 1:N relationships.

## 📊 Tables

### 👤 Users
- Auth data (email + password hash)
- UUID as primary key
- Timestamps for created/updated

### 📝 Assignments
- Linked to each user
- Has a title, deadline, description (optional), and status
- Status = 'pending' / 'in-progress' / 'completed' (yeah, just strings for now)

### 📒 Notes
- Study materials or resources
- Can include optional tags or links
- Only visible to the owner (user_id foreign key)

## 🔗 Relationships
- 1 user → many assignments
- 1 user → many notes
- `ON DELETE CASCADE` (if user is deleted, their stuff goes too)

## ⚡ Indexes
- Index user_id for fast lookups
- Sort assignments by deadline
- Filter notes by tag

## 🧪 Next Steps
- Run local PostgreSQL (done ✅)
- Apply Prisma schema and migrate (also done ✅)
- Test with some mock data (to-do maybe)
