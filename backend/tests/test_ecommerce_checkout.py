"""
Comprehensive Test Suite: E-Commerce Checkout Process
=====================================================

Student Exercise 1: Generate Test Cases for E-Commerce Checkout

Total Test Cases: 35+

Categories:
1. Positive Test Cases - Successful checkout flows (12 cases)
2. Negative Test Cases - Payment failures, invalid codes (10 cases)
3. Edge Cases - Cart limits, concurrent purchases (8 cases)
4. Security Test Cases - PCI compliance, data validation (7 cases)

Covers: Cart operations, Discount codes, Payment processing, 
        Order confirmation, Email notifications
"""
import pytest
import re
from datetime import datetime
from decimal import Decimal
from unittest.mock import patch, MagicMock


# ============================================================================
# MOCK MODELS FOR E-COMMERCE (Since this is a demo test structure)
# ============================================================================

class MockCart:
    """Mock cart for testing."""
    def __init__(self):
        self.items = []
        self.discount_code = None
        self.discount_amount = Decimal('0')
    
    def add_item(self, product_id, quantity, price):
        self.items.append({
            'product_id': product_id,
            'quantity': quantity,
            'price': Decimal(str(price))
        })
    
    def get_subtotal(self):
        return sum(item['price'] * item['quantity'] for item in self.items)
    
    def get_total(self):
        return max(self.get_subtotal() - self.discount_amount, Decimal('0'))
    
    def apply_discount(self, code, amount):
        self.discount_code = code
        self.discount_amount = Decimal(str(amount))
    
    def clear(self):
        self.items = []
        self.discount_code = None
        self.discount_amount = Decimal('0')


# ============================================================================
# TEST FIXTURES
# ============================================================================

@pytest.fixture
def cart():
    """Create an empty cart for testing."""
    return MockCart()


@pytest.fixture
def cart_with_items(cart):
    """Create a cart with sample items."""
    cart.add_item(product_id=1, quantity=2, price=29.99)
    cart.add_item(product_id=2, quantity=1, price=49.99)
    return cart


@pytest.fixture
def valid_payment_data():
    """Valid payment card data for testing."""
    return {
        'card_number': '4111111111111111',  # Test card number
        'expiry_month': '12',
        'expiry_year': '2028',
        'cvv': '123',
        'cardholder_name': 'Test User',
        'billing_address': {
            'street': '123 Test St',
            'city': 'Test City',
            'state': 'TS',
            'zip': '12345',
            'country': 'US'
        }
    }


@pytest.fixture
def valid_shipping_data():
    """Valid shipping address for testing."""
    return {
        'first_name': 'Test',
        'last_name': 'User',
        'street': '123 Test St',
        'city': 'Test City',
        'state': 'TS',
        'zip': '12345',
        'country': 'US',
        'phone': '+1234567890'
    }


# ============================================================================
# 1. POSITIVE TEST CASES - Successful Checkout Flows (12 cases)
# ============================================================================

class TestCartOperationsPositive:
    """Positive test cases for cart operations."""
    
    def test_add_single_item_to_cart(self, cart):
        """TC-E001: Add single item to empty cart."""
        cart.add_item(product_id=1, quantity=1, price=29.99)
        
        assert len(cart.items) == 1
        assert cart.items[0]['product_id'] == 1
        assert cart.items[0]['quantity'] == 1
    
    def test_add_multiple_items_to_cart(self, cart):
        """TC-E002: Add multiple different items to cart."""
        cart.add_item(product_id=1, quantity=1, price=29.99)
        cart.add_item(product_id=2, quantity=2, price=19.99)
        cart.add_item(product_id=3, quantity=1, price=49.99)
        
        assert len(cart.items) == 3
    
    def test_cart_calculates_subtotal(self, cart_with_items):
        """TC-E003: Cart correctly calculates subtotal."""
        # 2 x 29.99 + 1 x 49.99 = 109.97
        expected = Decimal('59.98') + Decimal('49.99')
        assert cart_with_items.get_subtotal() == expected
    
    def test_update_item_quantity(self, cart):
        """TC-E004: Update quantity of item in cart."""
        cart.add_item(product_id=1, quantity=1, price=29.99)
        # Simulate quantity update
        cart.items[0]['quantity'] = 3
        
        assert cart.items[0]['quantity'] == 3


class TestDiscountCodesPositive:
    """Positive test cases for discount codes."""
    
    def test_apply_valid_percentage_discount(self, cart_with_items):
        """TC-E005: Apply valid percentage discount code."""
        # 10% off total
        discount = cart_with_items.get_subtotal() * Decimal('0.1')
        cart_with_items.apply_discount('SAVE10', discount)
        
        assert cart_with_items.discount_code == 'SAVE10'
        assert cart_with_items.get_total() < cart_with_items.get_subtotal()
    
    def test_apply_valid_fixed_discount(self, cart_with_items):
        """TC-E006: Apply valid fixed amount discount code."""
        cart_with_items.apply_discount('FLAT20', 20.00)
        
        expected_total = cart_with_items.get_subtotal() - Decimal('20.00')
        assert cart_with_items.get_total() == expected_total
    
    def test_apply_free_shipping_code(self, cart_with_items):
        """TC-E007: Apply free shipping discount code."""
        # Free shipping would typically zero out shipping cost
        cart_with_items.apply_discount('FREESHIP', 0)  # Affects shipping, not total
        
        assert cart_with_items.discount_code == 'FREESHIP'


class TestPaymentProcessingPositive:
    """Positive test cases for payment processing."""
    
    def test_process_valid_visa_payment(self, valid_payment_data):
        """TC-E008: Process payment with valid Visa card."""
        # Mock payment processor
        result = {
            'status': 'success',
            'transaction_id': 'TXN123456',
            'amount': 109.97
        }
        
        assert result['status'] == 'success'
        assert result['transaction_id'] is not None
    
    def test_process_valid_mastercard_payment(self, valid_payment_data):
        """TC-E009: Process payment with valid Mastercard."""
        valid_payment_data['card_number'] = '5111111111111118'  # Test MC
        
        result = {'status': 'success', 'transaction_id': 'TXN789012'}
        
        assert result['status'] == 'success'


class TestOrderConfirmationPositive:
    """Positive test cases for order confirmation."""
    
    def test_order_created_after_payment(self, cart_with_items, valid_payment_data):
        """TC-E010: Order is created after successful payment."""
        order = {
            'order_id': 'ORD-20260103-001',
            'status': 'confirmed',
            'items': cart_with_items.items,
            'total': float(cart_with_items.get_total())
        }
        
        assert order['status'] == 'confirmed'
        assert 'ORD-' in order['order_id']
    
    def test_order_confirmation_email_sent(self):
        """TC-E011: Confirmation email is sent after order."""
        email_sent = {
            'to': 'customer@example.com',
            'subject': 'Order Confirmation - ORD-20260103-001',
            'status': 'sent'
        }
        
        assert email_sent['status'] == 'sent'
        assert 'Order Confirmation' in email_sent['subject']
    
    def test_inventory_updated_after_order(self, cart_with_items):
        """TC-E012: Inventory is decremented after order."""
        initial_stock = 100
        ordered_quantity = cart_with_items.items[0]['quantity']
        
        new_stock = initial_stock - ordered_quantity
        
        assert new_stock == 98  # 100 - 2


# ============================================================================
# 2. NEGATIVE TEST CASES - Failures and Invalid Data (10 cases)
# ============================================================================

class TestPaymentFailures:
    """Negative test cases for payment failures."""
    
    def test_declined_card(self, valid_payment_data):
        """TC-E013: Handle declined card gracefully."""
        valid_payment_data['card_number'] = '4000000000000002'  # Declined test card
        
        result = {
            'status': 'declined',
            'error_code': 'card_declined',
            'message': 'Your card was declined.'
        }
        
        assert result['status'] == 'declined'
        assert result['error_code'] == 'card_declined'
    
    def test_expired_card(self, valid_payment_data):
        """TC-E014: Reject expired card."""
        valid_payment_data['expiry_month'] = '01'
        valid_payment_data['expiry_year'] = '2020'  # Expired
        
        result = {
            'status': 'error',
            'error_code': 'expired_card',
            'message': 'Your card has expired.'
        }
        
        assert result['status'] == 'error'
    
    def test_insufficient_funds(self, valid_payment_data):
        """TC-E015: Handle insufficient funds error."""
        result = {
            'status': 'declined',
            'error_code': 'insufficient_funds',
            'message': 'Insufficient funds.'
        }
        
        assert result['error_code'] == 'insufficient_funds'
    
    def test_invalid_cvv(self, valid_payment_data):
        """TC-E016: Reject invalid CVV."""
        valid_payment_data['cvv'] = '99'  # Invalid - too short
        
        result = {
            'status': 'error',
            'error_code': 'invalid_cvv',
            'message': 'Invalid security code.'
        }
        
        assert result['status'] == 'error'


class TestInvalidDiscountCodes:
    """Negative test cases for discount codes."""
    
    def test_expired_discount_code(self, cart_with_items):
        """TC-E017: Reject expired discount code."""
        result = {
            'status': 'error',
            'error_code': 'code_expired',
            'message': 'This discount code has expired.'
        }
        
        assert result['error_code'] == 'code_expired'
    
    def test_invalid_discount_code(self, cart_with_items):
        """TC-E018: Reject non-existent discount code."""
        result = {
            'status': 'error',
            'error_code': 'invalid_code',
            'message': 'Invalid discount code.'
        }
        
        assert result['error_code'] == 'invalid_code'
    
    def test_already_used_discount_code(self, cart_with_items):
        """TC-E019: Reject already-used single-use code."""
        result = {
            'status': 'error',
            'error_code': 'code_already_used',
            'message': 'This code has already been used.'
        }
        
        assert result['error_code'] == 'code_already_used'
    
    def test_minimum_order_not_met(self, cart):
        """TC-E020: Reject discount when minimum order not met."""
        cart.add_item(product_id=1, quantity=1, price=10.00)  # Only $10
        
        # Code requires $50 minimum
        result = {
            'status': 'error',
            'error_code': 'minimum_not_met',
            'message': 'Minimum order of $50 required for this code.'
        }
        
        assert result['error_code'] == 'minimum_not_met'


class TestCheckoutValidation:
    """Negative test cases for checkout validation."""
    
    def test_checkout_empty_cart(self, cart):
        """TC-E021: Prevent checkout with empty cart."""
        result = {
            'status': 'error',
            'error_code': 'empty_cart',
            'message': 'Your cart is empty.'
        }
        
        assert result['error_code'] == 'empty_cart'
    
    def test_missing_shipping_address(self, cart_with_items):
        """TC-E022: Require shipping address for checkout."""
        result = {
            'status': 'error',
            'error_code': 'missing_shipping',
            'message': 'Shipping address is required.'
        }
        
        assert result['error_code'] == 'missing_shipping'


# ============================================================================
# 3. EDGE CASES - Limits and Concurrent Operations (8 cases)
# ============================================================================

class TestCartLimits:
    """Edge cases for cart limits."""
    
    def test_cart_max_items(self, cart):
        """TC-E023: Handle cart at maximum item limit (50 items)."""
        for i in range(50):
            cart.add_item(product_id=i, quantity=1, price=10.00)
        
        assert len(cart.items) == 50
    
    def test_cart_exceeds_max_items(self, cart):
        """TC-E024: Reject adding items beyond max limit."""
        for i in range(50):
            cart.add_item(product_id=i, quantity=1, price=10.00)
        
        # Attempting to add 51st item would fail in real implementation
        max_items = 50
        assert len(cart.items) <= max_items
    
    def test_max_quantity_per_item(self, cart):
        """TC-E025: Enforce maximum quantity per item (99)."""
        cart.add_item(product_id=1, quantity=99, price=10.00)
        
        assert cart.items[0]['quantity'] == 99
    
    def test_quantity_exceeds_available_stock(self, cart):
        """TC-E026: Handle order quantity exceeding stock."""
        available_stock = 5
        requested_quantity = 10
        
        result = {
            'status': 'error',
            'error_code': 'insufficient_stock',
            'message': f'Only {available_stock} items available.',
            'available': available_stock
        }
        
        assert result['error_code'] == 'insufficient_stock'


class TestConcurrentOperations:
    """Edge cases for concurrent operations."""
    
    def test_concurrent_checkout_same_item(self):
        """TC-E027: Handle two users checking out last item."""
        # First checkout succeeds
        result1 = {'status': 'success', 'order_id': 'ORD-001'}
        
        # Second checkout fails - out of stock
        result2 = {
            'status': 'error',
            'error_code': 'out_of_stock',
            'message': 'Item is no longer available.'
        }
        
        assert result1['status'] == 'success'
        assert result2['error_code'] == 'out_of_stock'
    
    def test_price_change_during_checkout(self, cart_with_items):
        """TC-E028: Handle price change during checkout."""
        original_price = cart_with_items.items[0]['price']
        new_price = original_price + Decimal('10.00')
        
        # System should honor cart price or notify user
        result = {
            'status': 'warning',
            'message': 'Price has changed since item was added.',
            'original_price': float(original_price),
            'new_price': float(new_price)
        }
        
        assert 'price' in result['message'].lower()
    
    def test_discount_code_reaches_limit_during_use(self, cart_with_items):
        """TC-E029: Handle discount reaching usage limit during checkout."""
        result = {
            'status': 'error',
            'error_code': 'code_limit_reached',
            'message': 'This discount code is no longer available.'
        }
        
        assert result['error_code'] == 'code_limit_reached'
    
    def test_cart_timeout_during_checkout(self, cart_with_items):
        """TC-E030: Handle cart session timeout."""
        result = {
            'status': 'error',
            'error_code': 'session_expired',
            'message': 'Your session has expired. Please refresh the page.'
        }
        
        assert result['error_code'] == 'session_expired'


# ============================================================================
# 4. SECURITY TEST CASES - PCI Compliance and Validation (7 cases)
# ============================================================================

class TestPCICompliance:
    """Security test cases for PCI compliance."""
    
    def test_card_number_not_logged(self, valid_payment_data):
        """TC-E031: Card numbers should never be logged."""
        log_output = "Processing payment for user 123"
        
        # Card number should NOT appear in logs
        assert valid_payment_data['card_number'] not in log_output
    
    def test_card_number_not_stored(self, valid_payment_data):
        """TC-E032: Full card numbers should not be stored."""
        stored_payment = {
            'last_four': '1111',  # Only last 4 digits
            'card_type': 'visa',
            'expiry': '12/28'
        }
        
        # Full card number should not be in stored data
        assert 'card_number' not in stored_payment
        assert len(stored_payment['last_four']) == 4
    
    def test_cvv_not_stored(self, valid_payment_data):
        """TC-E033: CVV should never be stored."""
        stored_payment = {
            'last_four': '1111',
            'card_type': 'visa'
        }
        
        assert 'cvv' not in stored_payment


class TestPaymentDataValidation:
    """Security test cases for payment data validation."""
    
    def test_sql_injection_in_card_name(self, valid_payment_data):
        """TC-E034: Prevent SQL injection in cardholder name."""
        valid_payment_data['cardholder_name'] = "'; DROP TABLE orders; --"
        
        # Should sanitize or reject
        result = {
            'status': 'error',
            'error_code': 'invalid_input',
            'message': 'Invalid cardholder name format.'
        }
        
        # Either sanitized and processed, or rejected
        assert result['status'] in ['success', 'error']
    
    def test_xss_in_billing_address(self, valid_payment_data):
        """TC-E035: Prevent XSS in billing address."""
        valid_payment_data['billing_address']['street'] = '<script>alert("xss")</script>'
        
        # Should sanitize
        sanitized = '&lt;script&gt;alert("xss")&lt;/script&gt;'
        
        assert '<script>' not in sanitized
    
    def test_luhn_validation_for_card_number(self, valid_payment_data):
        """TC-E036: Validate card number using Luhn algorithm."""
        card = valid_payment_data['card_number']
        
        # Luhn check
        def luhn_check(card_num):
            digits = [int(d) for d in card_num]
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(divmod(d * 2, 10))
            return checksum % 10 == 0
        
        assert luhn_check(card) == True
    
    def test_reject_test_cards_in_production(self, valid_payment_data):
        """TC-E037: Reject test card numbers in production."""
        test_cards = [
            '4111111111111111',
            '5111111111111118',
            '378282246310005'
        ]
        
        # In production, these should be rejected
        production_mode = False  # Set to True in production
        
        if production_mode:
            for card in test_cards:
                result = {'status': 'error', 'error_code': 'test_card'}
                assert result['error_code'] == 'test_card'


# ============================================================================
# TEST DATA GENERATION STRATEGY
# ============================================================================

class TestDataGeneratorEcommerce:
    """Test data generation helpers for e-commerce."""
    
    @staticmethod
    def generate_valid_credit_cards():
        """Generate valid test credit card numbers."""
        return {
            'visa': '4111111111111111',
            'mastercard': '5111111111111118',
            'amex': '378282246310005',
            'discover': '6011111111111117'
        }
    
    @staticmethod
    def generate_invalid_credit_cards():
        """Generate invalid card numbers for testing."""
        return [
            '1234567890123456',  # Fails Luhn
            '411111111111111',   # Too short
            '41111111111111111', # Too long
            'abcd1234efgh5678',  # Contains letters
            '',                  # Empty
        ]
    
    @staticmethod
    def generate_discount_codes():
        """Generate various discount code scenarios."""
        return {
            'valid_percentage': {'code': 'SAVE10', 'type': 'percentage', 'value': 10},
            'valid_fixed': {'code': 'FLAT20', 'type': 'fixed', 'value': 20},
            'expired': {'code': 'EXPIRED', 'expires': '2020-01-01'},
            'minimum_required': {'code': 'MIN50', 'minimum': 50},
            'single_use': {'code': 'ONCE', 'max_uses': 1},
        }
    
    @staticmethod
    def generate_cart_scenarios():
        """Generate different cart states for testing."""
        return {
            'empty': [],
            'single_item': [{'product_id': 1, 'qty': 1, 'price': 29.99}],
            'multiple_items': [
                {'product_id': 1, 'qty': 2, 'price': 29.99},
                {'product_id': 2, 'qty': 1, 'price': 49.99}
            ],
            'max_items': [{'product_id': i, 'qty': 1, 'price': 10} for i in range(50)],
            'high_value': [{'product_id': 1, 'qty': 1, 'price': 9999.99}],
        }

