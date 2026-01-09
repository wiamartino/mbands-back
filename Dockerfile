# Use the official Node.js image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Expose both HTTP and HTTPS ports
EXPOSE 3000 3443

# Create a non-root user in the Dockerfile
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set proper ownership of application files and directories
RUN chown -R appuser:appgroup /app

# Create certs directory with proper permissions
RUN mkdir -p /app/certs && chown -R appuser:appgroup /app/certs

# Set the user to the newly created non-root user
USER appuser

# Define the command to run the application
CMD ["npm", "run", "start:prod"]