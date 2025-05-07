FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps and force
RUN npm install --legacy-peer-deps --force

# Install specific version of Vite and terser
RUN npm install --save-dev vite@4.5.2 terser

# Copy the rest of the code
COPY . .

# Build the app
ENV NODE_ENV=production
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]