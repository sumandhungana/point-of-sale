FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["Backend.csproj", "./"]
RUN dotnet restore

# Copy the rest of the code
COPY . .

# Build and publish
RUN dotnet build -c Release -o /app/build
RUN dotnet publish -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy migration script
COPY migrate.sh /migrate.sh
RUN chmod +x /migrate.sh

EXPOSE 5000

# Set the entry point
ENTRYPOINT ["/migrate.sh"] 