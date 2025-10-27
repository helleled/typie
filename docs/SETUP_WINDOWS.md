# Windows Development Setup Guide (WSL)

This guide provides instructions for setting up the Typie development environment on Windows using Windows Subsystem for Linux (WSL).

## Prerequisites

### 1. Install WSL 2

Open PowerShell as Administrator and run:

```powershell
wsl --install
```

This will install WSL 2 with Ubuntu by default. Restart your computer when prompted.

### 2. Update Ubuntu

Open Ubuntu from the Start Menu and run:

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Install Required Tools

#### Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

#### Install Node.js 22

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Set up user and database
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb typie
```

#### Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo service redis-server start

# Enable Redis to start on boot
echo "sudo service redis-server start" >> ~/.bashrc
```

#### Install Meilisearch (Optional)

```bash
# Download and install Meilisearch
curl -L https://install.meilisearch.com | sh

# Move to user bin
mkdir -p ~/.local/bin
mv ./meilisearch ~/.local/bin/
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 4. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf input
```

## Project Setup

### 1. Clone the Repository

```bash
cd ~
git clone <repository-url>
cd typie
```

### 2. Run Setup Script

```bash
bun run setup
```

The setup script will:
- Check all dependencies
- Install packages
- Create environment files
- Set up the database
- Build shared packages

### 3. Start Services

```bash
# Start PostgreSQL (if not running)
sudo service postgresql start

# Start Redis (if not running)
sudo service redis-server start

# Start Meilisearch (optional)
meilisearch --master-key=masterKey &
```

### 4. Start Development

```bash
bun run dev
```

## WSL-Specific Considerations

### Accessing the Application

The development servers will be accessible from Windows:

- Website: http://localhost:3000
- API: http://localhost:4000
- GraphQL Playground: http://localhost:4000/graphql

### File System Performance

For best performance, keep your project files in the WSL file system (usually `~/`), not in `/mnt/c/`.

**Good:**
```bash
cd ~
git clone <repository>
```

**Bad (slow):**
```bash
cd /mnt/c/Users/YourName/Projects
git clone <repository>
```

### Service Management

WSL doesn't have systemd by default, so services need to be started manually:

```bash
# Create a startup script
cat > ~/start-services.sh << 'EOF'
#!/bin/bash
sudo service postgresql start
sudo service redis-server start
echo "Services started!"
EOF

chmod +x ~/start-services.sh

# Run before starting development
~/start-services.sh
```

### Port Forwarding

If you need to access the services from other devices on your network:

1. Find your Windows IP: `ipconfig` in PowerShell
2. Create port forwarding rules:

```powershell
# Run in PowerShell as Administrator
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=localhost
netsh interface portproxy add v4tov4 listenport=4000 listenaddress=0.0.0.0 connectport=4000 connectaddress=localhost
```

### Memory Limits

WSL 2 can use a lot of memory. To limit it, create `.wslconfig` in your Windows user directory:

```
# %USERPROFILE%\.wslconfig
[wsl2]
memory=8GB
processors=4
```

Then restart WSL:
```powershell
wsl --shutdown
```

## Troubleshooting

### Services Not Starting

If PostgreSQL or Redis won't start:

```bash
# Check status
sudo service postgresql status
sudo service redis-server status

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
sudo tail -f /var/log/redis/redis-server.log

# Restart services
sudo service postgresql restart
sudo service redis-server restart
```

### Cannot Connect to Database

If you get "peer authentication failed":

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Change this line:
# local   all             postgres                                peer
# To:
# local   all             postgres                                md5

# Restart PostgreSQL
sudo service postgresql restart
```

### Permission Issues

If you get permission errors:

```bash
# Fix ownership
sudo chown -R $USER:$USER ~/typie

# Fix PostgreSQL permissions
sudo chmod 755 /var/run/postgresql
```

### WSL Network Issues

If you can't access the services from Windows:

```bash
# Check WSL IP
ip addr show eth0 | grep inet

# Access using WSL IP instead of localhost
# For example: http://172.x.x.x:3000
```

### Out of Memory

If builds fail due to memory:

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
echo 'export NODE_OPTIONS="--max-old-space-size=4096"' >> ~/.bashrc
```

## Using VS Code with WSL

### Install VS Code Extensions

1. Install "Remote - WSL" extension in VS Code
2. Open your project from WSL:
   ```bash
   code .
   ```

### Recommended Extensions

- ESLint
- Prettier
- Svelte for VS Code
- GraphQL: Language Feature Support
- PostgreSQL

### Settings for WSL

Add to VS Code settings (`.vscode/settings.json`):

```json
{
  "remote.WSL.fileWatcher.polling": true,
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.turbo/**": true
  }
}
```

## Using Docker Desktop with WSL 2

If you prefer to run services in Docker:

### 1. Install Docker Desktop for Windows

Download from: https://www.docker.com/products/docker-desktop

Enable WSL 2 integration in Docker Desktop settings.

### 2. Create Docker Compose File

Already available in the repository. Start services:

```bash
docker compose up -d
```

### 3. Update Environment

The default `.env` files are already configured for Docker services on localhost.

## Performance Tips

1. **Use WSL 2 file system**: Keep projects in `~/` not `/mnt/c/`
2. **Exclude from Windows Defender**: Add WSL directory to exclusions
3. **Use Windows Terminal**: Better than default console
4. **Enable systemd** (Ubuntu 22.04+):
   ```bash
   sudo nano /etc/wsl.conf
   # Add:
   # [boot]
   # systemd=true
   ```
5. **Close unused terminals**: Multiple terminals can slow down WSL

## Alternative: Native Windows Setup

If you prefer not to use WSL, you can install tools natively:

- **PostgreSQL**: Download from postgresql.org
- **Redis**: Use Memurai (Redis alternative for Windows)
- **Bun**: Download from bun.sh/download
- **Node.js**: Download from nodejs.org

However, WSL is recommended for the best compatibility with the development tools used in this project.

## Getting Help

If you encounter issues specific to Windows/WSL:

1. Check WSL documentation: https://docs.microsoft.com/windows/wsl/
2. Review the main [SETUP.md](SETUP.md) guide
3. Search or create issues on GitHub
