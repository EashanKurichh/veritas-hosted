# Use an official OpenJDK 21 JDK image for the build stage
FROM openjdk:21-jdk-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper files and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Copy the source code
COPY src src

# Make mvnw executable
RUN chmod +x mvnw

# Build the Spring Boot application (skip tests for faster build)
RUN ./mvnw clean install -DskipTests

# Use a smaller, runtime-focused OpenJDK 21 JRE image for the final application
# Using 'bullseye' variant for better compatibility and explicit selection
FROM openjdk:21-jre-slim-bullseye

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the 'build' stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app listens on (default 8080)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]