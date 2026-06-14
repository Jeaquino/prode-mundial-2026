document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var password = form.password.value;
    var confirmPassword = form.confirmPassword.value;

    var valid = true;

    function setError(id, message) {
      document.getElementById(id).textContent = message;
      valid = false;
    }

    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';

    if (name.length < 3) {
      setError('nameError', 'El nombre debe tener al menos 3 caracteres.');
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('emailError', 'Ingresa un correo electrónico válido.');
    }

    if (password.length < 8) {
      setError('passwordError', 'La contraseña debe tener al menos 8 caracteres.');
    }

    if (password !== confirmPassword) {
      setError('confirmPasswordError', 'Las contraseñas no coinciden.');
    }

    if (!valid) {
      event.preventDefault();
    }
  });
});
