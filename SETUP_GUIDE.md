# HL7 Message Creator - Setup Guide

This guide will walk you through setting up the Electron application both for development and production deployment with Docker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Setup](#docker-setup)
4. [Building Executables](#building-executables)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### For Local Development
- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For cloning the repository

### For Docker Deployment
- **Docker**: Version 20.x or higher ([Download](https://www.docker.com/))
- **Docker Compose**: Usually comes with Docker Desktop

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB, recommended 8GB
- **Disk Space**: 500MB for application + data

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/JMThomas00/HL7MessageCreator-Electron.git
cd HL7MessageCreator-Electron
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Electron framework
- electron-builder for packaging
- papaparse for CSV parsing
- All development dependencies

### Step 3: Verify Data Files

Ensure the following CSV files exist in the `data/` directory:
- `surgical_procedures.csv`
- `staff.csv`

These files are included in the repository, but you can customize them for your organization.

### Step 4: Run the Application

```bash
npm start
```

The application should launch in a new window.

### Development Mode with DevTools

To run with Chrome DevTools open for debugging:

```bash
npm run dev
```

## Docker Setup

Docker allows you to run the application in an isolated container, which is useful for deployment on servers or for consistent environments.

### Option 1: Using Docker Command

#### Build the Image

```bash
docker build -t hl7-message-creator:latest .
```

This process takes 3-5 minutes on first build.

#### Run the Container

```bash
docker run -d \
  --name hl7-creator \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  hl7-message-creator:latest
```

Explanation of flags:
- `-d`: Run in detached mode (background)
- `--name`: Name the container for easy reference
- `-p 3000:3000`: Map port 3000 (change if needed)
- `-v`: Mount data directory for persistence
- `--restart`: Automatically restart on failure

#### Check Container Status

```bash
docker ps
```

#### View Logs

```bash
docker logs hl7-creator
```

#### Stop the Container

```bash
docker stop hl7-creator
docker rm hl7-creator
```

### Option 2: Using Docker Compose (Recommended)

Docker Compose simplifies the deployment process.

#### Start the Application

```bash
docker-compose up -d
```

#### View Logs

```bash
docker-compose logs -f
```

#### Stop the Application

```bash
docker-compose down
```

#### Rebuild After Changes

```bash
docker-compose up -d --build
```

### Docker Environment Variables

You can customize the deployment by setting environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - DISPLAY=:99
  - PORT=3000  # Change if port 3000 is in use
```

## Building Executables

To create standalone executables for distribution:

### Build for Current Platform

```bash
npm run build
```

Output will be in the `dist/` directory.

### Build for Specific Platforms

#### Windows

```bash
npm run build:win
```

Creates: `dist/HL7 Message Creator Setup.exe`

#### macOS

```bash
npm run build:mac
```

Creates: `dist/HL7 Message Creator.dmg`

#### Linux

```bash
npm run build:linux
```

Creates: `dist/HL7 Message Creator.AppImage`

### Cross-Platform Building

Note: Building for macOS requires a Mac. Building for Windows from macOS/Linux requires Wine.

To build for all platforms:

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

## Configuration

### Customizing Data Files

#### Surgical Procedures

Edit `data/surgical_procedures.csv` with your organization's procedures:

```csv
id,name,cpt,specialty,category,description,special_needs
PROC001,Your Procedure,12345,Specialty,Category,Description,Special Requirements
```

#### Staff Members

Edit `data/staff.csv` with your organization's staff:

```csv
id,name,role,specialty
SURG001,DOE JOHN,Surgeon,General Surgery
```

### Application Icons

Place custom icons in the `assets/` directory:
- `icon.png` - Linux (512x512)
- `icon.ico` - Windows (256x256)
- `icon.icns` - macOS (512x512)

You can generate these from a source image using tools like:
- [IconGenerator](https://icongeneratorapp.com/)
- [CloudConvert](https://cloudconvert.com/png-to-ico)

### Port Configuration

If port 3000 is already in use, modify:

1. In `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3001 to your desired port
```

2. In `Dockerfile`, if exposing different port:
```dockerfile
EXPOSE 3001  # Change to match
```

## Troubleshooting

### Issue: "npm install" fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Electron fails to start

**Possible causes:**
1. Incorrect Node.js version
   ```bash
   node --version  # Should be 18.x or higher
   ```

2. Missing dependencies
   ```bash
   npm install --force
   ```

3. File permissions (Linux/Mac)
   ```bash
   chmod +x node_modules/.bin/electron
   ```

### Issue: CSV files not loading

**Solution:**
1. Verify files exist: `ls -la data/`
2. Check file format (UTF-8 encoding, comma-delimited)
3. Ensure no special characters in filenames
4. Check file permissions:
   ```bash
   chmod 644 data/*.csv
   ```

### Issue: Docker container exits immediately

**Diagnosis:**
```bash
docker logs hl7-creator
```

**Common solutions:**
1. Port already in use:
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill the process or change port in docker-compose.yml
   ```

2. Volume mount issues:
   ```bash
   # Use absolute path
   docker run -v /absolute/path/to/data:/app/data ...
   ```

### Issue: Application builds but won't run

**For Windows:**
- Disable antivirus temporarily
- Run as administrator
- Check Windows Defender settings

**For macOS:**
- Allow app in Security & Privacy settings
- Try: `xattr -cr "HL7 Message Creator.app"`

**For Linux:**
- Make AppImage executable: `chmod +x "HL7 Message Creator.AppImage"`
- Install FUSE if needed: `sudo apt install fuse`

### Issue: Docker build is slow

**Solution:**
1. Use BuildKit:
   ```bash
   export DOCKER_BUILDKIT=1
   docker build -t hl7-message-creator .
   ```

2. Use Docker layer caching
3. Increase Docker memory allocation (Docker Desktop settings)

## Performance Optimization

### For Development
- Use `npm start` instead of `npm run dev` when DevTools aren't needed
- Close unused Chrome DevTools tabs
- Monitor memory usage in Task Manager

### For Docker Deployment
- Use multi-stage builds (already configured)
- Set memory limits:
  ```yaml
  deploy:
    resources:
      limits:
        memory: 512M
  ```

## Security Considerations

### For Production Deployment

1. **File Permissions**: Ensure data files have appropriate permissions
   ```bash
   chmod 600 data/*.csv  # Read/write for owner only
   ```

2. **Docker Security**:
   - Don't run as root (already configured)
   - Use read-only volumes where possible
   - Keep Docker updated

3. **Data Protection**:
   - Backup `data/` directory regularly
   - Use encrypted volumes for sensitive data
   - Implement access controls

## Getting Help

If you encounter issues not covered here:

1. Check the [main README](README.md)
2. Review [GitHub Issues](https://github.com/JMThomas00/HL7MessageCreator-Electron/issues)
3. Create a new issue with:
   - Operating system and version
   - Node.js/Docker version
   - Error messages and logs
   - Steps to reproduce

## Next Steps

After successful setup:
1. Review the [User Guide](README.md#usage)
2. Customize data files for your organization
3. Test with sample data
4. Deploy to production environment
5. Consider Mirth Connect integration (Phase 2)
