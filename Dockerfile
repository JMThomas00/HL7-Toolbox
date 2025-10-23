FROM node:18-alpine

# Install dependencies for Electron
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    xvfb \
    dbus

# Set environment variables
ENV ELECTRON_DISABLE_SANDBOX=1
ENV DISPLAY=:99

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create data directory for persistent storage
RUN mkdir -p /app/data

# Expose port for any future web interface
EXPOSE 3000

# Start Xvfb and the application
CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x16 & npm start"]
