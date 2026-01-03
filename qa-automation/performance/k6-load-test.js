/**
 * k6 Load Testing Script
 * =======================
 * Comprehensive load testing for the API with multiple scenarios.
 * 
 * Run with: k6 run k6-load-test.js
 * Run with options: k6 run --vus 50 --duration 5m k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// =============================================================================
// CUSTOM METRICS
// =============================================================================

const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const ticketCreationTime = new Trend('ticket_creation_time');
const authTime = new Trend('auth_time');
const searchLatency = new Trend('search_latency');
const requestCounter = new Counter('total_requests');

// =============================================================================
// CONFIGURATION
// =============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

// Test thresholds - fail test if these are exceeded
export const options = {
  // Test scenarios
  scenarios: {
    // Smoke test - minimal load to verify system works
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      startTime: '0s',
      tags: { scenario: 'smoke' },
    },
    // Load test - normal expected load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },   // Ramp up
        { duration: '3m', target: 20 },   // Stay at 20 users
        { duration: '1m', target: 0 },    // Ramp down
      ],
      startTime: '30s',
      tags: { scenario: 'load' },
    },
    // Stress test - find breaking point
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      startTime: '6m',
      tags: { scenario: 'stress' },
    },
    // Spike test - sudden traffic spike
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },  // Sudden spike
        { duration: '1m', target: 100 },   // Stay high
        { duration: '10s', target: 0 },    // Quick drop
      ],
      startTime: '13m',
      tags: { scenario: 'spike' },
    },
  },

  // Thresholds for pass/fail
  thresholds: {
    // Response time (p95 < 500ms, p99 < 1000ms)
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    
    // Error rate < 1%
    errors: ['rate<0.01'],
    
    // Custom metrics thresholds
    api_latency: ['p(95)<400'],
    auth_time: ['p(95)<300'],
    ticket_creation_time: ['p(95)<500'],
    search_latency: ['p(95)<600'],
    
    // Request rate
    http_reqs: ['rate>10'],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Authenticate and get JWT token
 */
function authenticate(email, password) {
  const payload = JSON.stringify({
    email: email,
    password: password,
  });

  const response = http.post(`${BASE_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'auth-login' },
  });

  authTime.add(response.timings.duration);

  const success = check(response, {
    'auth: status is 200': (r) => r.status === 200,
    'auth: has access_token': (r) => JSON.parse(r.body).access_token !== undefined,
  });

  if (!success) {
    errorRate.add(1);
    return null;
  }

  return JSON.parse(response.body).access_token;
}

/**
 * Create authorization header
 */
function authHeader(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
}

/**
 * Random test data generators
 */
function generateTicketData() {
  return {
    title: `Load Test Ticket ${randomString(8)}`,
    description: `This is a test ticket created during load testing. ${randomString(50)}`,
    priority: ['low', 'medium', 'high', 'urgent'][randomIntBetween(0, 3)],
    category: ['technical', 'billing', 'general', 'feature_request'][randomIntBetween(0, 3)],
  };
}

// =============================================================================
// MAIN TEST FUNCTION
// =============================================================================

export default function() {
  const testUser = {
    email: `loadtest_${randomString(8)}@example.com`,
    username: `loadtest_${randomString(8)}`,
    password: 'LoadTest123!',
  };

  // ===========================================================================
  // SETUP: Register and authenticate
  // ===========================================================================
  
  group('Authentication', () => {
    // Register user
    const registerPayload = JSON.stringify(testUser);
    const registerRes = http.post(`${BASE_URL}/auth/register`, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'auth-register' },
    });
    
    requestCounter.add(1);
    
    if (registerRes.status !== 201) {
      // User might already exist, try login
      const token = authenticate(testUser.email, testUser.password);
      if (!token) {
        errorRate.add(1);
        return;
      }
    }
  });

  // Get auth token
  const token = authenticate(testUser.email, testUser.password);
  if (!token) {
    return; // Can't proceed without auth
  }

  // ===========================================================================
  // TEST SCENARIO 1: Browse Tickets
  // ===========================================================================
  
  group('Browse Tickets', () => {
    // List tickets
    const listRes = http.get(`${BASE_URL}/tickets`, authHeader(token));
    
    requestCounter.add(1);
    apiLatency.add(listRes.timings.duration);
    
    check(listRes, {
      'list tickets: status is 200': (r) => r.status === 200,
      'list tickets: response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);

    sleep(randomIntBetween(1, 3));

    // Paginated request
    const paginatedRes = http.get(`${BASE_URL}/tickets?page=1&per_page=20`, authHeader(token));
    requestCounter.add(1);
    
    check(paginatedRes, {
      'pagination: status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  // ===========================================================================
  // TEST SCENARIO 2: Create Ticket
  // ===========================================================================
  
  group('Create Ticket', () => {
    const ticketData = generateTicketData();
    const createStart = Date.now();
    
    const createRes = http.post(
      `${BASE_URL}/tickets`,
      JSON.stringify(ticketData),
      authHeader(token)
    );
    
    ticketCreationTime.add(Date.now() - createStart);
    requestCounter.add(1);
    
    const createSuccess = check(createRes, {
      'create ticket: status is 201': (r) => r.status === 201,
      'create ticket: has ticket_number': (r) => {
        try {
          return JSON.parse(r.body).ticket.ticket_number !== undefined;
        } catch {
          return false;
        }
      },
      'create ticket: response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    if (!createSuccess) {
      errorRate.add(1);
      return;
    }

    // Get created ticket ID
    const ticketId = JSON.parse(createRes.body).ticket.id;

    sleep(randomIntBetween(1, 2));

    // View ticket detail
    const detailRes = http.get(`${BASE_URL}/tickets/${ticketId}`, authHeader(token));
    requestCounter.add(1);
    
    check(detailRes, {
      'ticket detail: status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  // ===========================================================================
  // TEST SCENARIO 3: Search
  // ===========================================================================
  
  group('Search', () => {
    const searchTerms = ['test', 'bug', 'feature', 'error', 'help'];
    const searchTerm = searchTerms[randomIntBetween(0, searchTerms.length - 1)];
    
    const searchStart = Date.now();
    const searchRes = http.get(
      `${BASE_URL}/tickets?search=${searchTerm}`,
      authHeader(token)
    );
    
    searchLatency.add(Date.now() - searchStart);
    requestCounter.add(1);
    
    check(searchRes, {
      'search: status is 200': (r) => r.status === 200,
      'search: response time < 600ms': (r) => r.timings.duration < 600,
    }) || errorRate.add(1);
  });

  // ===========================================================================
  // TEST SCENARIO 4: Dashboard/Analytics
  // ===========================================================================
  
  group('Dashboard', () => {
    // This would hit dashboard endpoints if they exist
    const dashboardRes = http.get(`${BASE_URL}/tickets?stats=true`, authHeader(token));
    requestCounter.add(1);
    apiLatency.add(dashboardRes.timings.duration);
    
    check(dashboardRes, {
      'dashboard: status is 2xx': (r) => r.status >= 200 && r.status < 300,
    }) || errorRate.add(1);
  });

  // Random think time between iterations
  sleep(randomIntBetween(1, 5));
}

// =============================================================================
// LIFECYCLE HOOKS
// =============================================================================

export function setup() {
  console.log('🚀 Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  
  // Verify API is reachable
  const healthCheck = http.get(`${BASE_URL.replace('/api/v1', '')}/health`);
  if (healthCheck.status !== 200) {
    console.error('❌ API is not reachable!');
    return null;
  }
  
  console.log('✅ API is healthy');
  return { startTime: Date.now() };
}

export function teardown(data) {
  if (data) {
    const duration = (Date.now() - data.startTime) / 1000;
    console.log(`\n🏁 Load test completed in ${duration.toFixed(2)} seconds`);
  }
}

// =============================================================================
// CUSTOM SUMMARY
// =============================================================================

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    metrics: {
      http_req_duration: data.metrics.http_req_duration,
      errors: data.metrics.errors,
      http_reqs: data.metrics.http_reqs,
      api_latency: data.metrics.api_latency,
      auth_time: data.metrics.auth_time,
      ticket_creation_time: data.metrics.ticket_creation_time,
      search_latency: data.metrics.search_latency,
    },
    thresholds: data.thresholds,
  };

  return {
    'reports/performance/k6-summary.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  
  let output = '\n╔══════════════════════════════════════════════════════════╗\n';
  output += '║               K6 LOAD TEST SUMMARY                        ║\n';
  output += '╠══════════════════════════════════════════════════════════╣\n';
  
  if (metrics.http_req_duration) {
    const p95 = metrics.http_req_duration.values['p(95)'];
    const p99 = metrics.http_req_duration.values['p(99)'];
    output += `║  Response Time (p95): ${p95.toFixed(2)}ms                       ║\n`;
    output += `║  Response Time (p99): ${p99.toFixed(2)}ms                       ║\n`;
  }
  
  if (metrics.http_reqs) {
    const rate = metrics.http_reqs.values.rate;
    output += `║  Request Rate: ${rate.toFixed(2)} req/s                          ║\n`;
  }
  
  if (metrics.errors) {
    const errorPct = (metrics.errors.values.rate * 100).toFixed(2);
    output += `║  Error Rate: ${errorPct}%                                  ║\n`;
  }
  
  output += '╚══════════════════════════════════════════════════════════╝\n';
  
  return output;
}

