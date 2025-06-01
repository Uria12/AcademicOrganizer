# Database Design - Academic Organizer

## Overview
PostgreSQL database with 3 main entities: Users, Assignments, and Notes.

## Tables

### Users
- Stores user authentication data
- Uses UUID for primary keys
- Email-based authentication

### Assignments
- Linked to users via foreign key
- Tracks deadline, status, and description
- Status: pending, in-progress, completed

### Notes
- Study materials and resources
- Optional links and tags for organization
- Linked to users for privacy

## Relationships
- One User → Many Assignments (1:N)
- One User → Many Notes (1:N)
- Cascade delete: when user deleted, all their data is removed

## Indexes
- User lookups on assignments and notes
- Deadline sorting for assignments
- Tag-based filtering for notes

## Next Steps
- Set up local PostgreSQL
- Run Prisma migrations
- Test with sample data