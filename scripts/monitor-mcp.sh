#!/bin/bash

# MCP Endpoint Monitoring Script
# Monitors MCP endpoints for timeouts and connection issues

# Configuration
PROJECT_NAME="oz-mcp"
LOG_FILE="mcp-monitor-$(date +%Y%m%d).log"
ALERT_THRESHOLD=5  # Alert after 5 consecutive errors
ERROR_COUNT=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Function to check if vercel CLI is available
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        log_message "ERROR" "${RED}Vercel CLI not found. Please install it with: npm install -g vercel${NC}"
        exit 1
    fi
}

# Function to monitor vercel logs
monitor_vercel_logs() {
    log_message "INFO" "${BLUE}Starting Vercel logs monitoring for project: $PROJECT_NAME${NC}"
    
    # Start monitoring logs in background
    vercel logs --project="$PROJECT_NAME" --follow 2>&1 | while IFS= read -r line; do
        # Check for MCP-related errors
        if echo "$line" | grep -qE "(mcp/sse|timeout|undici)"; then
            # Check for timeout errors
            if echo "$line" | grep -qE "(Timeout|timeout)"; then
                ((ERROR_COUNT++))
                log_message "ERROR" "${RED}MCP Timeout detected: $line${NC}"
                
                # Alert if threshold reached
                if [ $ERROR_COUNT -ge $ALERT_THRESHOLD ]; then
                    log_message "ALERT" "${RED}ALERT: $ERROR_COUNT consecutive errors detected!${NC}"
                    send_alert "MCP Timeout Alert" "$line"
                    ERROR_COUNT=0
                fi
            # Check for undici client activity
            elif echo "$line" | grep -qE "undici"; then
                log_message "WARNING" "${YELLOW}High undici client activity: $line${NC}"
            # Check for MCP SSE connections
            elif echo "$line" | grep -qE "mcp/sse"; then
                log_message "INFO" "${GREEN}MCP SSE activity: $line${NC}"
                ERROR_COUNT=0  # Reset error count on successful activity
            fi
        fi
        
        # Log all lines for debugging
        echo "$line" >> "mcp-full-$(date +%Y%m%d).log"
    done
}

# Function to send alerts (placeholder - customize based on your notification system)
send_alert() {
    local subject=$1
    local message=$2
    
    log_message "ALERT" "Sending alert: $subject"
    
    # Example: Send to Slack webhook (uncomment and configure)
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$subject: $message\"}" \
    #   "$SLACK_WEBHOOK_URL"
    
    # Example: Send email (uncomment and configure)
    # echo "$message" | mail -s "$subject" admin@yourdomain.com
    
    # Example: Write to system log
    logger "MCP Alert: $subject - $message"
}

# Function to check MCP endpoint health
check_mcp_health() {
    local base_url="https://oz-mcp.vercel.app"
    
    log_message "INFO" "${BLUE}Checking MCP endpoint health...${NC}"
    
    # Check heartbeat endpoint
    local heartbeat_status=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/api/mcp-heartbeat" -X POST \
        -H "Content-Type: application/json" \
        -d '{"action":"stats"}')
    
    if [ "$heartbeat_status" -eq 200 ]; then
        log_message "INFO" "${GREEN}MCP Heartbeat endpoint healthy (200)${NC}"
    else
        log_message "ERROR" "${RED}MCP Heartbeat endpoint unhealthy ($heartbeat_status)${NC}"
        ((ERROR_COUNT++))
    fi
    
    # Check main MCP endpoint with a test request
    local mcp_status=$(curl -s -o /dev/null -w "%{http_code}" "$base_url/api/mcp" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test_token" \
        -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_oz_status","arguments":{}},"id":1}')
    
    if [ "$mcp_status" -eq 401 ]; then
        log_message "INFO" "${GREEN}MCP API endpoint responding (401 - auth required as expected)${NC}"
    elif [ "$mcp_status" -eq 200 ]; then
        log_message "INFO" "${GREEN}MCP API endpoint healthy (200)${NC}"
    else
        log_message "ERROR" "${RED}MCP API endpoint unhealthy ($mcp_status)${NC}"
        ((ERROR_COUNT++))
    fi
}

# Function to analyze connection patterns
analyze_connections() {
    log_message "INFO" "${BLUE}Analyzing recent connection patterns...${NC}"
    
    # Get recent logs and analyze
    local temp_log="temp_analysis_$(date +%s).log"
    vercel logs --project="$PROJECT_NAME" --since="1h" > "$temp_log" 2>/dev/null
    
    if [ -f "$temp_log" ]; then
        # Count undici connections
        local undici_count=$(grep -c "undici" "$temp_log" 2>/dev/null || echo "0")
        
        # Count timeouts
        local timeout_count=$(grep -ci "timeout" "$temp_log" 2>/dev/null || echo "0")
        
        # Count SSE connections
        local sse_count=$(grep -c "mcp/sse" "$temp_log" 2>/dev/null || echo "0")
        
        log_message "INFO" "Last hour stats:"
        log_message "INFO" "  - Undici requests: $undici_count"
        log_message "INFO" "  - Timeouts: $timeout_count"
        log_message "INFO" "  - SSE connections: $sse_count"
        
        # Calculate error rate
        if [ "$sse_count" -gt 0 ]; then
            local error_rate=$((timeout_count * 100 / sse_count))
            log_message "INFO" "  - Error rate: ${error_rate}%"
            
            if [ "$error_rate" -gt 20 ]; then
                log_message "WARNING" "${YELLOW}High error rate detected: ${error_rate}%${NC}"
                send_alert "High MCP Error Rate" "Error rate: ${error_rate}% (${timeout_count}/${sse_count})"
            fi
        fi
        
        # Cleanup
        rm -f "$temp_log"
    else
        log_message "WARNING" "Could not fetch recent logs for analysis"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  monitor     - Start continuous monitoring of MCP endpoints"
    echo "  health      - Check MCP endpoint health once"
    echo "  analyze     - Analyze recent connection patterns"
    echo "  logs        - Show filtered MCP logs from the last hour"
    echo "  help        - Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  SLACK_WEBHOOK_URL - Slack webhook for alerts (optional)"
    echo "  EMAIL_RECIPIENT   - Email address for alerts (optional)"
}

# Function to show filtered logs
show_logs() {
    log_message "INFO" "${BLUE}Showing MCP-related logs from the last hour...${NC}"
    vercel logs --project="$PROJECT_NAME" --since="1h" 2>/dev/null | \
        grep -E "(mcp|undici|timeout|Timeout|SSE|sse)" | \
        head -50
}

# Main script logic
main() {
    local command=${1:-monitor}
    
    log_message "INFO" "${GREEN}MCP Monitor Script started${NC}"
    log_message "INFO" "Command: $command"
    log_message "INFO" "Log file: $LOG_FILE"
    
    check_vercel_cli
    
    case $command in
        "monitor")
            log_message "INFO" "Starting continuous monitoring... (Press Ctrl+C to stop)"
            trap 'log_message "INFO" "Monitoring stopped"; exit 0' INT
            
            while true; do
                check_mcp_health
                analyze_connections
                sleep 300  # Check every 5 minutes
            done
            ;;
        "health")
            check_mcp_health
            ;;
        "analyze")
            analyze_connections
            ;;
        "logs")
            show_logs
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            echo "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run the script
main "$@"