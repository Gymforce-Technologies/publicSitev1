# Use Node.js 18 Alpine as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

RUN npm install -g pnpm turbo

# Copy the entire project
COPY . .
    
# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build the intl app using TurboRepo
RUN turbo run build --filter=intl...

# Install production dependencies for the intl app
RUN pnpm install --prod --frozen-lockfile --filter=intl...

# Expose the port the app runs on
EXPOSE 3001

# Set working directory to gymforcev5
WORKDIR /app/apps/gymforcev5

# Start the Next.js app
CMD ["pnpm", "next", "start", "-p", "3001"]
