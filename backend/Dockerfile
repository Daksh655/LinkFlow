# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies
RUN mvn dependency:go-offline
COPY src ./src
# Build the application skipping tests
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Expose port
EXPOSE 8080
# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
