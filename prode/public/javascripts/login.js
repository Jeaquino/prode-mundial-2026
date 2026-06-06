// Validación del formulario de login
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = loginForm.querySelector('button[type="submit"]');

  // Validación en tiempo real
  emailInput.addEventListener('blur', function() {
    validateEmail();
  });

  emailInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      validateEmail();
    }
  });

  passwordInput.addEventListener('blur', function() {
    validatePassword();
  });

  passwordInput.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      validatePassword();
    }
  });

  // Validación al enviar el formulario
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Limpiar errores previos
    clearAllErrors();

    // Validar campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isEmailValid && isPasswordValid) {
      // Si todas las validaciones pasan, enviar el formulario
      submitBtn.disabled = true;
      submitBtn.textContent = 'Iniciando sesión...';
      
      // Usar setTimeout para permitir que se vea el cambio de texto antes de enviar
      setTimeout(() => {
        this.submit();
      }, 100);
    }
  });

  /**
   * Valida el formato del correo electrónico
   * @returns {boolean} true si es válido, false en caso contrario
   */
  function validateEmail() {
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    if (email === '') {
      emailError.textContent = 'El correo electrónico es requerido';
      emailError.classList.add('show');
      emailInput.classList.add('error');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      emailError.textContent = 'Por favor ingresa un correo electrónico válido';
      emailError.classList.add('show');
      emailInput.classList.add('error');
      isValid = false;
    } else {
      emailError.classList.remove('show');
      emailInput.classList.remove('error');
    }

    return isValid;
  }

  /**
   * Valida el campo de contraseña
   * @returns {boolean} true si es válido, false en caso contrario
   */
  function validatePassword() {
    const password = passwordInput.value;
    const passwordError = document.getElementById('passwordError');

    let isValid = true;

    if (password === '') {
      passwordError.textContent = 'La contraseña es requerida';
      passwordError.classList.add('show');
      passwordInput.classList.add('error');
      isValid = false;
    } else if (password.length < 8) {
      passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres';
      passwordError.classList.add('show');
      passwordInput.classList.add('error');
      isValid = false;
    } else {
      passwordError.classList.remove('show');
      passwordInput.classList.remove('error');
    }

    return isValid;
  }

  /**
   * Limpia todos los mensajes de error
   */
  function clearAllErrors() {
    document.getElementById('emailError').classList.remove('show');
    document.getElementById('passwordError').classList.remove('show');
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
  }

  // Permitir Enter en los inputs para enviar el formulario
  [emailInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
      }
    });
  });
});
