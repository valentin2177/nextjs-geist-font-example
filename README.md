# Google Keep Clone

A fully functional, self-hosted Google Keep clone built with Next.js, PostgreSQL, and Docker. Perfect for running on Unraid or any Docker-compatible system.

## Features

- **Note Management**
  - Create, edit, and delete notes
  - Rich text support
  - Color coding (6 color options)
  - Pin important notes to the top
  - Archive and trash functionality
  - Image attachments

- **Organization**
  - Tags/labels for categorization
  - Search functionality across all notes
  - Filter by tags, archive, or trash
  - Reminders with date/time picker

- **User Management**
  - Secure authentication with NextAuth.js
  - User registration and login
  - Password hashing with bcrypt
  - Session management

- **Self-Hosted**
  - Runs entirely on your own infrastructure
  - PostgreSQL database for data persistence
  - Docker and docker-compose support
  - Unraid-compatible

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (30+ components)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 16 with Prisma ORM
- **Authentication**: NextAuth.js
- **Containerization**: Docker & Docker Compose

## Quick Start with Docker Compose (Recommended)

### Prerequisites

- Docker and Docker Compose installed
- At least 512MB RAM available
- Port 8000 available (or configure a different port)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/valentin2177/nextjs-geist-font-example
cd nextjs-geist-font-example
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Generate a secure NextAuth secret:
```bash
openssl rand -base64 32
```

4. Edit `.env` and update the following:
```env
NEXTAUTH_SECRET="<your-generated-secret>"
NEXTAUTH_URL="http://your-server-ip:8000"  # Change to your actual URL
POSTGRES_PASSWORD="<choose-a-strong-password>"
```

5. Start the services:
```bash
docker-compose up -d
```

6. Wait for the services to start (usually 30-60 seconds), then access the app at:
```
http://localhost:8000
```

7. Create your first account by clicking "Sign up" on the login page.

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop and remove all data (WARNING: Deletes database)
docker-compose down -v
```

## Unraid Installation

### Method 1: Using the Template (Recommended)

1. In Unraid, go to **Docker** tab
2. Click **Add Container**
3. At the bottom, click **Template repositories**
4. Add this repository URL (replace with your actual repo):
   ```
   https://github.com/yourusername/googlekeep-clone
   ```
5. Search for "Google Keep Clone" in the template list
6. Click on the template and configure:
   - **WebUI Port**: 8000 (or your preferred port)
   - **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
   - **NEXTAUTH_URL**: Set to your server URL (e.g., `http://192.168.1.100:8000`)
   - **Postgres Password**: Choose a strong password
7. Click **Apply** and wait for the container to start

### Method 2: Using Docker Compose

1. Install the **Compose.Manager** plugin in Unraid (Community Applications)
2. Create a new folder in your appdata directory: `/mnt/user/appdata/googlekeep/`
3. Upload the `docker-compose.yml` file to this folder
4. Create a `.env` file in the same folder with your configuration
5. In Compose.Manager, add the stack and start it

## Manual Installation (Without Docker)

### Prerequisites

- Node.js 20+ installed
- PostgreSQL 16+ installed and running
- npm or yarn package manager

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd nextjs-geist-font-example
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials and generate secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/googlekeep?schema=public"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:8000"
NODE_ENV="production"
```

5. Run database migrations:
```bash
npx prisma migrate deploy
# or
npx prisma db push
```

6. Build the application:
```bash
npm run build
```

7. Start the production server:
```bash
npm run start
```

8. Access the app at `http://localhost:8000`

## Development

### Running Locally for Development

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Start a PostgreSQL database (or use Docker):
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=googlekeep -p 5432:5432 -d postgres:16-alpine
```

3. Create `.env`:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/googlekeep?schema=public"
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:8000"
NODE_ENV="development"
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Run migrations:
```bash
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

7. Open `http://localhost:8000` in your browser

### Database Management

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEXTAUTH_URL` | Public URL of your application | Yes | - |
| `NEXTAUTH_SECRET` | Secret for NextAuth (min 32 chars) | Yes | - |
| `NODE_ENV` | Environment (`development` or `production`) | No | `production` |
| `POSTGRES_USER` | PostgreSQL username (Docker only) | No | `keepuser` |
| `POSTGRES_PASSWORD` | PostgreSQL password (Docker only) | Yes | - |
| `POSTGRES_DB` | PostgreSQL database name (Docker only) | No | `googlekeep` |
| `APP_PORT` | Port to run the app on | No | `8000` |

### Changing the Port

**Docker Compose:**
Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "3000:8000"  # External:Internal
```

**Manual Installation:**
The app runs on port 8000 by default. Change this in `package.json`:
```json
"dev": "next dev -p 3000"
```

## Backup and Restore

### Backup Database (Docker)

```bash
# Create a backup
docker-compose exec postgres pg_dump -U keepuser googlekeep > backup.sql

# Or with docker-compose down, backup the volume
docker run --rm -v googlekeep_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

### Restore Database (Docker)

```bash
# Restore from SQL dump
docker-compose exec -T postgres psql -U keepuser googlekeep < backup.sql

# Or restore from volume backup
docker run --rm -v googlekeep_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Troubleshooting

### Container won't start

1. Check logs: `docker-compose logs app`
2. Ensure PostgreSQL is ready: `docker-compose logs postgres`
3. Verify environment variables in `.env`
4. Check port 8000 is not in use: `netstat -an | grep 8000`

### Database connection errors

1. Verify `DATABASE_URL` is correct
2. Ensure PostgreSQL container is running: `docker-compose ps`
3. Check network connectivity: `docker-compose exec app ping postgres`

### Authentication issues

1. Verify `NEXTAUTH_SECRET` is set and not empty
2. Check `NEXTAUTH_URL` matches your actual URL
3. Clear browser cookies and try again
4. Check app logs for errors: `docker-compose logs app`

### Migration errors

```bash
# Reset and rerun migrations (WARNING: Deletes all data)
docker-compose exec app npx prisma migrate reset --force
docker-compose exec app npx prisma migrate deploy
```

## Security Considerations

- **Change default passwords**: Always use strong, unique passwords in production
- **Use HTTPS**: Configure a reverse proxy (nginx, Caddy) with SSL certificates
- **Keep secrets secret**: Never commit `.env` files to version control
- **Regular backups**: Set up automated database backups
- **Update regularly**: Keep dependencies and Docker images up to date
- **Firewall**: Only expose necessary ports to the internet

## Performance Tuning

### PostgreSQL Optimization

Add to `docker-compose.yml` under postgres service:
```yaml
command:
  - "postgres"
  - "-c"
  - "max_connections=100"
  - "-c"
  - "shared_buffers=256MB"
  - "-c"
  - "effective_cache_size=1GB"
```

### Next.js Optimization

The app is already configured with:
- Standalone output mode for smaller Docker images
- Image optimization enabled
- Production builds with minification
- TypeScript strict mode

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Notes Endpoints

- `GET /api/notes` - Get all notes
- `GET /api/notes?archived=true` - Get archived notes
- `GET /api/notes?deleted=true` - Get deleted notes
- `POST /api/notes` - Create a note
- `GET /api/notes/[id]` - Get a single note
- `PATCH /api/notes/[id]` - Update a note
- `DELETE /api/notes/[id]` - Delete a note permanently

### Tags Endpoints

- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create a tag
- `PATCH /api/tags/[id]` - Update a tag
- `DELETE /api/tags/[id]` - Delete a tag

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Your chosen license - e.g., MIT]

## Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the logs: `docker-compose logs -f app`

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
