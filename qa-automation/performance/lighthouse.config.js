/**
 * Lighthouse CI Configuration
 * ============================
 * Extended configuration for performance and accessibility testing.
 */

module.exports = {
  ci: {
    // =========================================================================
    // COLLECT: How to run Lighthouse
    // =========================================================================
    collect: {
      // Number of times to run each URL
      numberOfRuns: 3,

      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/#/products',
        'http://localhost:3000/#/kanban',
        'http://localhost:3000/#/dashboard',
        'http://localhost:3000/#/settings',
      ],

      // Lighthouse settings
      settings: {
        // Desktop preset for consistent results
        preset: 'desktop',

        // Categories to test
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],

        // Throttling settings (simulate real conditions)
        throttling: {
          cpuSlowdownMultiplier: 1,
          rttMs: 40,
          throughputKbps: 10240,
        },

        // Skip audits that require network
        skipAudits: [
          'uses-http2',
          'uses-long-cache-ttl',
        ],

        // Chrome flags
        chromeFlags: [
          '--headless',
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
        ],
      },

      // Static dist directory (alternative to URL)
      // staticDistDir: './frontend/dist',

      // Start server command
      startServerCommand: 'cd frontend && npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
    },

    // =========================================================================
    // ASSERT: Define pass/fail thresholds
    // =========================================================================
    assert: {
      // Preset with some adjustments
      preset: 'lighthouse:recommended',

      assertions: {
        // =======================================================================
        // PERFORMANCE (Target: 80%+)
        // =======================================================================
        'categories:performance': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        
        // Resource size
        'total-byte-weight': ['warn', { maxNumericValue: 500000 }],
        'unminified-javascript': 'error',
        'unminified-css': 'error',
        'unused-javascript': 'warn',
        'unused-css-rules': 'warn',
        
        // Images
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',

        // =======================================================================
        // ACCESSIBILITY (Target: 90%+)
        // =======================================================================
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // Critical accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'html-has-lang': 'error',
        'document-title': 'error',
        'meta-viewport': 'error',
        'bypass': 'warn',
        'heading-order': 'warn',
        'tabindex': 'error',

        // =======================================================================
        // BEST PRACTICES (Target: 80%+)
        // =======================================================================
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        
        'errors-in-console': 'warn',
        'deprecations': 'warn',
        'doctype': 'error',
        'charset': 'error',
        'no-vulnerable-libraries': 'error',
        'js-libraries': 'off',
        'valid-source-maps': 'warn',

        // =======================================================================
        // SEO (Target: 80%+)
        // =======================================================================
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        'viewport': 'error',
        'meta-description': 'warn',
        'link-text': 'warn',
        'crawlable-anchors': 'warn',
        'is-crawlable': 'warn',

        // =======================================================================
        // PWA (Optional)
        // =======================================================================
        'categories:pwa': 'off',
      },
    },

    // =========================================================================
    // UPLOAD: Where to store results
    // =========================================================================
    upload: {
      // Temporary public storage (for CI)
      target: 'temporary-public-storage',

      // Or use local filesystem
      // target: 'filesystem',
      // outputDir: './reports/lighthouse',

      // Or Lighthouse CI Server
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};

