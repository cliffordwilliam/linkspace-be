#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

CI_MODE=0
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=1
fi

# === Colors ===
readonly YELLOW='\033[1;33m'
readonly GREEN='\033[1;32m'
readonly RED='\033[1;31m'
readonly NC='\033[0m'

# === Icons ===
readonly ICON_INFO="🔍"
readonly ICON_EXIT="🚪"
readonly ICON_SUCCESS="✅"
readonly ICON_FAIL="❌"
readonly ICON_COPY="📋"
readonly ICON_WARNING="⚠️"

# === Formatting ===
readonly LABEL_WIDTH=15
readonly BANNER_PADDING=5

# === Names ===
readonly ENV_CONFIG_FILE_NAME=".env.config"
readonly ENV_CONFIG_EXAMPLE_FILE_NAME=".env.config.example"
readonly ENV_FILE_NAME=".env"
readonly ENV_EXAMPLE_FILE_NAME=".env.example"
readonly APP_NAME_DESC="BE app"
readonly DBMS_CONTAINER_DESC="DBMS container"
readonly DB_DIR="db/migrations"
readonly POSTMAN_DIR="postman"
readonly POSTMAN_COLLECTION="$POSTMAN_DIR/postman_collection.json"
readonly POSTMAN_ENVIRONMENT="$POSTMAN_DIR/postman_environment.json"
readonly RESET_SQL="$DB_DIR/reset_database.sql"
readonly MIGRATION_SQL="$DB_DIR/schema.sql"
readonly SEED_SQL="$DB_DIR/seed.sql"
readonly DOCKER_YAML_FILE_NAME="$DB_DIR/docker-compose.yml"
readonly PACKAGE_JSON_DEV_BUILD_SCRIPT_NAME="dev:build"
readonly PACKAGE_JSON_DEV_START_SCRIPT_NAME="dev:start"
readonly PACKAGE_JSON_BUILD_SCRIPT_NAME="build"
readonly PACKAGE_JSON_START_SCRIPT_NAME="start"
readonly PACKAGE_JSON_POSTMAN_SCRIPT_NAME="test:e2e"
readonly PACKAGE_JSON_FILE_NAME="package.json"
readonly DIST_DIR="dist"
readonly BUILT_ENTRY_FILE="$DIST_DIR/index.js"

# === Variables ===
DID_CLEANUP=0
DID_CREATE_CONTAINER=0
APP_PID=0
BUILD_PID=0

print_status() {
    local color="$1"
    local icon="$2"
    local label="$3"
    local message="${4:-}"
    printf "${color}${icon} %-*s${NC}" "$LABEL_WIDTH" "$label"
    [[ -n "$message" ]] && printf " %s" "$message"
    printf "\n"
}

wait_for_build() {
    local file="$1"
    local name="${2:-Build}"
    local retries=0

    print_status "$YELLOW" "$ICON_INFO" "Waiting for $name to complete..." "$file"

    until [ -f "$file" ]; do
        if (( retries >= MAX_RETRIES )); then
            exit_helper "❌ $name did not produce $file after $MAX_RETRIES attempts" 1
        fi
        retries=$((retries + 1))
        sleep 0.5
    done

    print_status "$GREEN" "$ICON_SUCCESS" "$name ready" "$file exists"
    printf "\n"
}

exit_helper() {
    local exit_message="$1"
    local exit_code="$2"

    local message_color
    if [[ "$exit_code" -eq 0 ]]; then
        message_color="$GREEN"
    else
        message_color="$RED"
    fi

    print_status "$RED" "$ICON_EXIT" "Exiting:" "$exit_message"
    printf "\n"

    exit "$exit_code"
}

exit_on_lie() {
    local action_name="$1"
    local condition="$2"

    print_status "$YELLOW" "$ICON_INFO" "Statement:" "$action_name"

    local status_label
    local status_icon
    local status_color

    if ! eval "$condition"; then
        status_label="Lie"
        status_icon="$ICON_FAIL"
        status_color="$RED"
    else
        status_label="True"
        status_icon="$ICON_SUCCESS"
        status_color="$GREEN"
    fi

    print_status "$status_color" "$status_icon" "$status_label"
    printf "\n"

    if [[ "$status_label" == "Lie" ]]; then
        exit_helper "Lie: $action_name" 1
    fi
}

print_banner() {
    local text="$1"
    local text_length=${#text}
    local total_width=$((text_length + 2 * BANNER_PADDING))
    local border_line
    local padding_spaces

    border_line=$(printf '=%.0s' $(seq 1 "$total_width"))
    padding_spaces=$(printf ' %.0s' $(seq 1 "$BANNER_PADDING"))

    printf "%s\n" "$border_line"
    printf "%s%s%s\n" "$padding_spaces" "$text" "$padding_spaces"
    printf "%s\n\n" "$border_line"
}

copy_env_if_missing() {
    local env_file_name="$1"
    local example_env_file_name="$2"

    print_status "$YELLOW" "$ICON_INFO" "Checking:" "$env_file_name file presence"
    if [ ! -f "$env_file_name" ]; then
        print_status "$RED" "$ICON_FAIL" "$env_file_name file missing"
        print_status "$YELLOW" "$ICON_COPY" "Copying $example_env_file_name → $env_file_name"
        if cp "$example_env_file_name" "$env_file_name"; then
            success_msg="$env_file_name created"
        else
            exit_helper "Failed to copy $example_env_file_name to $env_file_name" 1
        fi
    else
        success_msg="$env_file_name is present"
    fi
    print_status "$GREEN" "$ICON_SUCCESS" "$success_msg"
    printf "\n"
}

load_env() {
    local env_file_name="$1"
    print_status "$YELLOW" "$ICON_COPY" "Loading $env_file_name values"

    if [ ! -f "$env_file_name" ]; then
        exit_helper "$env_file_name is missing" 1
    fi

    set -o allexport
    if ! source "$env_file_name"; then
        set +o allexport
        exit_helper "Failed to load $env_file_name — please check for syntax errors." 1
    fi
    set +o allexport

    print_status "$GREEN" "$ICON_SUCCESS" "$env_file_name loaded"
    printf "\n"
}

cleanup() {
    if [ "$DID_CLEANUP" -eq 1 ]; then
        return
    fi
    DID_CLEANUP=1

    printf "\n"

    print_banner "Cleaning Up"

    # Delete dist directory if it exists
    if [ -d "$DIST_DIR" ]; then
        print_status "$YELLOW" "$ICON_COPY" "Deleting build directory" "$DIST_DIR"
        rm -rf "$DIST_DIR"
        print_status "$GREEN" "$ICON_SUCCESS" "Deleted $DIST_DIR"
    else
        print_status "$GREEN" "$ICON_SUCCESS" "$DIST_DIR does not exist, nothing to delete"
    fi
    printf "\n"

    # Kill TypeScript build watcher
    print_status "$YELLOW" "$ICON_COPY" "Checking for running build process"
    if [ "${BUILD_PID:-0}" -ne 0 ]; then
        print_status "$YELLOW" "$ICON_COPY" "Stopping build process"
        kill -- -"$BUILD_PID" 2>/dev/null || true
        BUILD_PID=0
    else
        print_status "$YELLOW" "$ICON_COPY" "Build process is not running"
    fi
    printf "\n"

    # Kill application process
    print_status "$YELLOW" "$ICON_COPY" "Checking for running $APP_NAME_DESC"
    if [ "${APP_PID:-0}" -ne 0 ]; then
        print_status "$YELLOW" "$ICON_COPY" "Stopping $APP_NAME_DESC"
        kill -- -"$APP_PID" 2>/dev/null || true
        APP_PID=0
    else
        print_status "$YELLOW" "$ICON_COPY" "$APP_NAME_DESC is not running"
    fi
    printf "\n"

    # Kill DBMS containers & volumes
    exit_on_lie "Docker is installed" "command -v docker >/dev/null 2>&1"
    if [ "$DID_CREATE_CONTAINER" -eq 1 ]; then
        print_status "$YELLOW" "$ICON_COPY" "Stopping $DBMS_CONTAINER_DESC"
        exit_on_lie "Stopping and removing DBMS + volumes" \
            "docker compose --env-file \"$ENV_FILE_NAME\" -f \"$DOCKER_YAML_FILE_NAME\" down -v --remove-orphans"
        DID_CREATE_CONTAINER=0
    else
        print_status "$YELLOW" "$ICON_COPY" "$DBMS_CONTAINER_DESC is not made"
    fi
    printf "\n"

    exit_helper "${ICON_SUCCESS} Cleanup complete." 0
}
trap cleanup SIGINT SIGTERM EXIT ERR

check_docker_version() {
    local version
    version=$(docker version --format '{{.Server.Version}}' 2>/dev/null) || return 1
    version=$(echo "$version" | grep -Eo '^[0-9]+\.[0-9]+\.[0-9]+') || return 1

    IFS='.' read -r major minor patch <<< "$version"

    (( major > DOCKER_REQUIRED_MAJOR_VERSION )) && return 0
    (( major < DOCKER_REQUIRED_MAJOR_VERSION )) && return 1

    (( minor > DOCKER_REQUIRED_MINOR_VERSION )) && return 0
    (( minor < DOCKER_REQUIRED_MINOR_VERSION )) && return 1

    (( patch >= DOCKER_REQUIRED_PATCH_VERSION )) && return 0 || return 1
}

check_node_version() {
    local version
    version=$(node --version 2>/dev/null) || return 1
    version=${version#v}
    version=$(echo "$version" | grep -Eo '^[0-9]+\.[0-9]+\.[0-9]+') || return 1

    IFS='.' read -r major minor patch <<< "$version"

    (( major > NODE_REQUIRED_MAJOR_VERSION )) && return 0
    (( major < NODE_REQUIRED_MAJOR_VERSION )) && return 1

    (( minor > NODE_REQUIRED_MINOR_VERSION )) && return 0
    (( minor < NODE_REQUIRED_MINOR_VERSION )) && return 1

    (( patch >= NODE_REQUIRED_PATCH_VERSION )) && return 0 || return 1
}

wait_for_ready() {
    sleep 1
    local name="$1"
    local cmd="$2"
    local retries=0
    local max_retries="${3:-$MAX_RETRIES}"

    until eval "$cmd"; do
        if (( retries >= max_retries )); then
            exit_helper "❌ $name did not become ready in time." 1
        fi
        print_status "$YELLOW" "$ICON_COPY" "Waiting for ${name}... (attempt $((retries+1))/$max_retries)"
        retries=$((retries+1))
        sleep 1
    done
    print_status "$GREEN" "$ICON_SUCCESS" "$name is ready"
}

is_port_free() {
    local port="$1"
    local status=1  # default: in use

    if command -v nc >/dev/null 2>&1; then
        # Try both GNU and BSD netcat variants
        nc -z -w 1 localhost "$port" >/dev/null 2>&1
        status=$?
    else
        # /dev/tcp returns 0 if open (in use), non-zero if closed
        (echo >"/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1
        status=$?
    fi

    # Normalize: return 0 if free, 1 if in use
    if [[ $status -eq 0 ]]; then
        return 1  # in use
    else
        return 0  # free
    fi
}

is_port_in_use() {
    ! is_port_free "$1"
}

print_banner "market-space-be"

print_banner "Env Check"
exit_on_lie "$ENV_EXAMPLE_FILE_NAME is present" "[ -f \"$ENV_EXAMPLE_FILE_NAME\" ]"
copy_env_if_missing "$ENV_FILE_NAME" "$ENV_EXAMPLE_FILE_NAME"
load_env "$ENV_FILE_NAME"

print_banner "Env Config Check"
exit_on_lie "$ENV_CONFIG_EXAMPLE_FILE_NAME is present" "[ -f \"$ENV_CONFIG_EXAMPLE_FILE_NAME\" ]"
copy_env_if_missing "$ENV_CONFIG_FILE_NAME" "$ENV_CONFIG_EXAMPLE_FILE_NAME"
load_env "$ENV_CONFIG_FILE_NAME"

print_banner "Validating $ENV_FILE_NAME Variables"
# PostgreSQL database
exit_on_lie "DB_USER is not empty" '[[ -n "$DB_USER" ]]'
exit_on_lie "DB_PASSWORD is not empty" '[[ -n "$DB_PASSWORD" ]]'
exit_on_lie "DB_HOST is not empty" '[[ -n "$DB_HOST" ]]'
exit_on_lie "DB_PORT is a valid port number" '[[ "$DB_PORT" =~ ^[0-9]+$ && "$DB_PORT" -ge 1 && "$DB_PORT" -le 65535 ]]'
exit_on_lie "DB_NAME is not empty" '[[ -n "$DB_NAME" ]]'
# DBMS container
exit_on_lie "DBMS_CONTAINER_NAME is not empty" '[[ -n "$DBMS_CONTAINER_NAME" ]]'
exit_on_lie "DBMS_CONTAINER_IMAGE is not empty" '[[ -n "$DBMS_CONTAINER_IMAGE" ]]'
# App port
exit_on_lie "LOCALHOST is not empty" '[[ -n "$LOCALHOST" ]]'
exit_on_lie "PORT is a valid port number" '[[ "$PORT" =~ ^[0-9]+$ && "$PORT" -ge 1 && "$PORT" -le 65535 ]]'
exit_on_lie "PROTOCOL is either http or https" '[[ "$PROTOCOL" == "http" || "$PROTOCOL" == "https" ]]'
# Admirer port
exit_on_lie "ADMIRER_PORT is a valid port number" '[[ "$ADMIRER_PORT" =~ ^[0-9]+$ && "$ADMIRER_PORT" -ge 1 && "$ADMIRER_PORT" -le 65535 ]]'
# Admirer container
exit_on_lie "ADMIRER_CONTAINER_NAME is not empty" '[[ -n "$ADMIRER_CONTAINER_NAME" ]]'
exit_on_lie "ADMIRER_CONTAINER_IMAGE is not empty" '[[ -n "$ADMIRER_CONTAINER_IMAGE" ]]'
# App state
exit_on_lie "NODE_ENV is valid" '[[ "$NODE_ENV" == "development" || "$NODE_ENV" == "production" || "$NODE_ENV" == "test" ]]'
exit_on_lie "API_PREFIX starts with /" '[[ "$API_PREFIX" == /* ]]'
# Script or tooling config
exit_on_lie "MAX_RETRIES is a positive integer" '[[ "$MAX_RETRIES" =~ ^[0-9]+$ && "$MAX_RETRIES" -ge 1 ]]'
exit_on_lie "DOCKER_REQUIRED_MAJOR_VERSION is a positive integer" '[[ "$DOCKER_REQUIRED_MAJOR_VERSION" =~ ^[0-9]+$ && "$DOCKER_REQUIRED_MAJOR_VERSION" -ge 1 ]]'
exit_on_lie "DOCKER_REQUIRED_MINOR_VERSION is a non-negative integer" '[[ "$DOCKER_REQUIRED_MINOR_VERSION" =~ ^[0-9]+$ && "$DOCKER_REQUIRED_MINOR_VERSION" -ge 0 ]]'
exit_on_lie "DOCKER_REQUIRED_PATCH_VERSION is a non-negative integer" '[[ "$DOCKER_REQUIRED_PATCH_VERSION" =~ ^[0-9]+$ && "$DOCKER_REQUIRED_PATCH_VERSION" -ge 0 ]]'
exit_on_lie "NODE_REQUIRED_MAJOR_VERSION is a positive integer" '[[ "$NODE_REQUIRED_MAJOR_VERSION" =~ ^[0-9]+$ && "$NODE_REQUIRED_MAJOR_VERSION" -ge 1 ]]'
exit_on_lie "NODE_REQUIRED_MINOR_VERSION is a non-negative integer" '[[ "$NODE_REQUIRED_MINOR_VERSION" =~ ^[0-9]+$ && "$NODE_REQUIRED_MINOR_VERSION" -ge 0 ]]'
exit_on_lie "NODE_REQUIRED_PATCH_VERSION is a non-negative integer" '[[ "$NODE_REQUIRED_PATCH_VERSION" =~ ^[0-9]+$ && "$NODE_REQUIRED_PATCH_VERSION" -ge 0 ]]'

print_banner "Checking Prerequisites"
# jq
exit_on_lie "jq is installed" "command -v jq >/dev/null 2>&1"
# Docker
exit_on_lie "Docker is installed" "command -v docker >/dev/null 2>&1"
exit_on_lie "Docker version is at least $DOCKER_REQUIRED_MAJOR_VERSION.$DOCKER_REQUIRED_MINOR_VERSION.$DOCKER_REQUIRED_PATCH_VERSION" "check_docker_version"
exit_on_lie "Docker is running" "docker info >/dev/null 2>&1"
exit_on_lie "Docker Compose is available" "docker compose version >/dev/null 2>&1"
# Node.js
exit_on_lie "Node.js is found" "command -v node >/dev/null 2>&1"
exit_on_lie "Node.js version is at least $NODE_REQUIRED_MAJOR_VERSION.$NODE_REQUIRED_MINOR_VERSION.$NODE_REQUIRED_PATCH_VERSION" "check_node_version"
# npm
exit_on_lie "npm is available" "command -v npm >/dev/null 2>&1"

print_banner "Installing dependencies"
exit_on_lie "${PACKAGE_JSON_FILE_NAME} is present" "[ -f \"${PACKAGE_JSON_FILE_NAME}\" ]"
exit_on_lie "${PACKAGE_JSON_FILE_NAME} is valid JSON" "jq empty \"${PACKAGE_JSON_FILE_NAME}\" >/dev/null 2>&1"
exit_on_lie "Dependencies installed" "npm install"

if [[ "$CI_MODE" -eq 1 ]]; then
    print_banner "Skipping Docker container startup (CI mode)"
else
    print_banner "Starting ${DBMS_CONTAINER_DESC}"
    exit_on_lie "No existing '${DBMS_CONTAINER_NAME}' ${DBMS_CONTAINER_DESC} found" "! docker container inspect \"$DBMS_CONTAINER_NAME\" >/dev/null 2>&1"
    exit_on_lie "${DOCKER_YAML_FILE_NAME} exists" "[ -f \"$DOCKER_YAML_FILE_NAME\" ]"
    exit_on_lie "Starting ${DBMS_CONTAINER_DESC}" "docker compose --env-file \"$ENV_FILE_NAME\" -f \"$DOCKER_YAML_FILE_NAME\" up -d --remove-orphans"
    DID_CREATE_CONTAINER=1
    wait_for_ready "PostgreSQL" "docker exec $DBMS_CONTAINER_NAME sh -c 'pg_isready -h localhost -p $DB_PORT -U $DB_USER && psql -h localhost -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"SELECT 1;\" >/dev/null'"

    print_banner "Initializing ${DBMS_CONTAINER_DESC}"
    # Reset
    exit_on_lie "Reset SQL file exists" "[ -f \"$RESET_SQL\" ]"
    exit_on_lie "Reset applied successfully" "docker exec -i \"$DBMS_CONTAINER_NAME\" psql -h localhost -p \"$DB_PORT\" -U \"$DB_USER\" -d \"$DB_NAME\" < \"$RESET_SQL\""
    # Migrate
    exit_on_lie "Migration SQL file exists" "[ -f \"$MIGRATION_SQL\" ]"
    exit_on_lie "Migration applied successfully" "docker exec -i \"$DBMS_CONTAINER_NAME\" psql -h localhost -p \"$DB_PORT\" -U \"$DB_USER\" -d \"$DB_NAME\" < \"$MIGRATION_SQL\""
    # Seed
    exit_on_lie "Seed SQL file exists" "[ -f \"$SEED_SQL\" ]"
    exit_on_lie "Seeding applied successfully" "docker exec -i \"$DBMS_CONTAINER_NAME\" psql -h localhost -p \"$DB_PORT\" -U \"$DB_USER\" -d \"$DB_NAME\" < \"$SEED_SQL\""
fi

if [[ "$CI_MODE" -eq 1 ]]; then
    print_banner "Starting ${APP_NAME_DESC} in CI mode"
    exit_on_lie "\"${PACKAGE_JSON_BUILD_SCRIPT_NAME}\" script exists in ${PACKAGE_JSON_FILE_NAME}" "jq -e '.scripts[\"${PACKAGE_JSON_BUILD_SCRIPT_NAME}\"]' \"${PACKAGE_JSON_FILE_NAME}\" >/dev/null 2>&1"
    exit_on_lie "\"${PACKAGE_JSON_START_SCRIPT_NAME}\" script exists in ${PACKAGE_JSON_FILE_NAME}" "jq -e '.scripts[\"${PACKAGE_JSON_START_SCRIPT_NAME}\"]' \"${PACKAGE_JSON_FILE_NAME}\" >/dev/null 2>&1"
    exit_on_lie "Port ${PORT} is free" "is_port_free ${PORT}"
    npm run ${PACKAGE_JSON_BUILD_SCRIPT_NAME}
    wait_for_build "$BUILT_ENTRY_FILE" "TypeScript Build"
    npm run ${PACKAGE_JSON_START_SCRIPT_NAME} &
    APP_PID=$!
    wait_for_ready "${APP_NAME_DESC}" "curl -sf ${PROTOCOL}://${LOCALHOST}:${PORT}/api/v1/healthz >/dev/null"
else
    print_banner "Starting ${APP_NAME_DESC}"
    exit_on_lie "\"${PACKAGE_JSON_DEV_BUILD_SCRIPT_NAME}\" script exists in ${PACKAGE_JSON_FILE_NAME}" "jq -e '.scripts[\"${PACKAGE_JSON_DEV_BUILD_SCRIPT_NAME}\"]' \"${PACKAGE_JSON_FILE_NAME}\" >/dev/null 2>&1"
    exit_on_lie "\"${PACKAGE_JSON_DEV_START_SCRIPT_NAME}\" script exists in ${PACKAGE_JSON_FILE_NAME}" "jq -e '.scripts[\"${PACKAGE_JSON_DEV_START_SCRIPT_NAME}\"]' \"${PACKAGE_JSON_FILE_NAME}\" >/dev/null 2>&1"
    exit_on_lie "Port ${PORT} is free" "is_port_free ${PORT}"
    npm run ${PACKAGE_JSON_DEV_BUILD_SCRIPT_NAME} &
    BUILD_PID=$!
    wait_for_build "$BUILT_ENTRY_FILE" "TypeScript Build"
    npm run ${PACKAGE_JSON_DEV_START_SCRIPT_NAME} &
    APP_PID=$!
    wait $BUILD_PID $APP_PID
    wait_for_ready "${APP_NAME_DESC}" "curl -sf ${PROTOCOL}://${LOCALHOST}:${PORT}/healthz >/dev/null"
    exit_on_lie "${APP_NAME_DESC} is running on ${PORT}" "is_port_in_use ${PORT}"
    print_status "$GREEN" "$ICON_SUCCESS" "Press Ctrl C to stop"
    print_status "$GREEN" "$ICON_SUCCESS" "Visit ${APP_NAME_DESC} ${PROTOCOL}://${LOCALHOST}:${PORT}${API_PREFIX}"
    print_status "$GREEN" "$ICON_SUCCESS" "Visit ${ADMIRER_CONTAINER_NAME} ${PROTOCOL}://${LOCALHOST}:${ADMIRER_PORT}"
    wait $APP_PID
fi

if [[ "$CI_MODE" -eq 1 ]]; then
    exit_on_lie "Postman collection file exists" "[ -f \"$POSTMAN_COLLECTION\" ]"
    exit_on_lie "Postman environment file exists" "[ -f \"$POSTMAN_ENVIRONMENT\" ]"

    BASE_URL="${PROTOCOL}://${LOCALHOST}:${PORT}" npm run ${PACKAGE_JSON_POSTMAN_SCRIPT_NAME}
    TEST_EXIT_CODE=$?

    print_banner "Stopping ${APP_NAME_DESC}"
    if [ "${APP_PID:-0}" -ne 0 ]; then
        kill -- -"$APP_PID" 2>/dev/null || true
        APP_PID=0
    fi

    if [[ "$TEST_EXIT_CODE" -eq 0 ]]; then
        exit_helper "All Newman tests passed 🎉" 0
    else
        exit_helper "Newman tests failed ❌" "$TEST_EXIT_CODE"
    fi
fi
