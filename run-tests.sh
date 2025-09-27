#!/bin/bash

# 🤖 AI Testing Agent Runner for Polish Citizenship Platform
# Comprehensive automated testing that eliminates manual checking

echo "🚀 Polish Citizenship Platform - AI Testing Agent"
echo "================================================="

# Function to display help
show_help() {
    echo "Available commands:"
    echo ""
    echo "  ./run-tests.sh quick      - Run quick core page tests (5 minutes)"
    echo "  ./run-tests.sh full       - Run complete test suite (15 minutes)"
    echo "  ./run-tests.sh mobile     - Run mobile-only tests (8 minutes)"
    echo "  ./run-tests.sh desktop    - Run desktop-only tests (8 minutes)"
    echo "  ./run-tests.sh debug      - Run tests with browser visible"
    echo "  ./run-tests.sh continuous - Start continuous testing agent"
    echo "  ./run-tests.sh dashboard  - Open testing dashboard"
    echo "  ./run-tests.sh install    - Install browser dependencies"
    echo "  ./run-tests.sh report     - View latest test report"
    echo ""
    echo "Example: ./run-tests.sh full"
}

# Install Playwright browsers
install_browsers() {
    echo "📦 Installing Playwright browsers..."
    npx playwright install
    echo "✅ Browser installation complete!"
}

# Quick test for core pages
run_quick() {
    echo "⚡ Running quick tests - Core pages and basic functionality"
    npx playwright test --grep "Core Pages" --reporter=line,html
    echo "✅ Quick tests completed!"
}

# Full comprehensive test suite
run_full() {
    echo "🔥 Running FULL test suite - All pages, workflows, and features"
    echo "This will test:"
    echo "  📄 Document processing (OCR, PDF generation)"
    echo "  🌳 Family Tree system (4 generations)"
    echo "  👤 User registration and authentication"
    echo "  🤖 AI chat and case analysis"
    echo "  📱 Mobile and desktop compatibility"
    echo "  🌐 Cross-browser testing"
    echo ""
    npx playwright test --reporter=line,html,json
    echo "✅ Full test suite completed!"
}

# Mobile-only testing
run_mobile() {
    echo "📱 Running mobile-specific tests"
    npx playwright test --project="Mobile Chrome" --project="Mobile Safari" --project="Mobile Firefox" --reporter=line,html
    echo "✅ Mobile tests completed!"
}

# Desktop-only testing
run_desktop() {
    echo "🖥️ Running desktop-specific tests"
    npx playwright test --project="chromium" --project="firefox" --project="webkit" --reporter=line,html
    echo "✅ Desktop tests completed!"
}

# Debug mode with visible browser
run_debug() {
    echo "🐛 Running tests in debug mode (browser visible)"
    npx playwright test --headed --project="chromium" --timeout=300000
}

# Continuous testing agent
run_continuous() {
    echo "🔄 Starting continuous testing agent..."
    echo "Agent will run tests every 30 minutes and auto-report issues"
    npx tsx e2e-tests/continuous-testing.ts
}

# Open testing dashboard
open_dashboard() {
    echo "📊 Opening AI Testing Dashboard..."
    echo "Dashboard available at: file://$(pwd)/e2e-tests/test-dashboard.html"
    # Try to open in browser (works on most systems)
    if command -v open &> /dev/null; then
        open "e2e-tests/test-dashboard.html"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "e2e-tests/test-dashboard.html"
    else
        echo "Please open e2e-tests/test-dashboard.html in your browser"
    fi
}

# View latest test report
view_report() {
    echo "📈 Opening latest test report..."
    npx playwright show-report
}

# Main command processing
case "$1" in
    "quick")
        run_quick
        ;;
    "full")
        run_full
        ;;
    "mobile")
        run_mobile
        ;;
    "desktop")
        run_desktop
        ;;
    "debug")
        run_debug
        ;;
    "continuous")
        run_continuous
        ;;
    "dashboard")
        open_dashboard
        ;;
    "install")
        install_browsers
        ;;
    "report")
        view_report
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "❓ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo "🎯 Testing complete! No more manual checking needed."
echo "Your AI agent is monitoring everything automatically."