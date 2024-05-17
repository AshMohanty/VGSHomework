const vgsForm = window.VGSCollect.create(
  'tnt3qmfciiv',
  'sandbox',
  (state) => {}
).setRouteId('431f97a0-cdba-48af-92f7-4aee1d7a82bd');

const css = {
  boxSizing: 'border-box',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI"',
  color: '#000000',
  '&::placeholder': {
    color: '#bcbcbc'
  }
};

const cardNumber = vgsForm.field('#cc-number', {
  type: 'card-number',
  name: 'card_number',
  placeholder: 'Card number',
  showCardIcon: {
    left: 0
  },
  validations: ['required', 'validCardNumber'],
  css: {
    paddingLeft: '40px',
    ...css
  },
});

const cardSecurityCode = vgsForm.field('#cc-cvc', {
  type: 'card-security-code',
  name: 'card_cvc',
  placeholder: 'CVV',
  validations: ['required', 'validCardSecurityCode'],
  css: css,
});

const cardExpDate = vgsForm.field('#cc-expiration-date', {
  type: 'card-expiration-date',
  name: 'card_exp',
  placeholder: 'MM / YY',
  validations: ['required', 'validCardExpirationDate'],
  css: css,
});

const submitVGSCollectForm = () => {
  vgsForm.submit('/post', {}, (status, data) => {
    if (status >= 200 && status <= 300) {
      // Successful response
      displayMessage('Payment successful! Your payment has been processed.');
      displayPaymentCompleteMessage();
    } else if (!status) {
      // Network Error occurred
      displayMessage('Network error occurred. Please try again later.');
    } else {
      // Server Error
      displayMessage('Server error occurred. Please try again later.');
    }
  }, (validationError) => {
    // Form validation error
    displayMessage('Form validation error. Please check your inputs and try again.');
  });
}

document.getElementById('vgs-collect-form').addEventListener('submit', (e) => {
  e.preventDefault();
  submitVGSCollectForm();
});

function displayMessage(message) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');
  setTimeout(() => {
    messageElement.classList.add('hidden');
  }, 5000); // Hide message after 5 seconds
}

function displayPaymentCompleteMessage() {
  const paymentCompleteMessage = document.getElementById('payment-complete-message');
  paymentCompleteMessage.classList.remove('hidden');
}
