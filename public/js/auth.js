// Grab elements
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");
const togglePassword = document.getElementById("togglePassword");

// ---------- Toggle between forms ----------
showSignup.addEventListener("click", () => {
  loginForm.style.display = "none";
  signupForm.style.display = "block";
  document.querySelector("title").textContent = "Register";
  clearErrors();
});

showLogin.addEventListener("click", () => {
  signupForm.style.display = "none";
  loginForm.style.display = "block";
  document.querySelector("title").textContent = "Login";

  clearErrors();
});

loginForm.addEventListener("submit", (e) => {
  clearErrors();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let isValid = true;

  if (email && password) {
    if (!emailRegex.test(email)) {
      loginError.textContent = "Please enter a valid email address.";
      e.preventDefault();
      isValid = false;
    }
  } else {
    loginError.textContent = "Please enter your email and password.";
    e.preventDefault();
    isValid = false;
  }
});

signupForm.addEventListener("submit", (e) => {
  clearErrors();

  const name = document.getElementById("signupName").value.trim();
  const country = document.getElementById("country").value;
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let isValid = true;

  if (!name || !country || !email || !password) {
    signupError.textContent = "Please, fill in all fields";
    e.preventDefault();
    isValid = false;
    return;
  } else {
    if (name.length < 2) {
      signupError.textContent = "Name must be at least 2 characters";
      isValid = false;
      e.preventDefault();

      return;
    }

    if (!country) {
      signupError.textContent = "Please select your country.";
      e.preventDefault();
      isValid = false;

      return;
    }

    if (!email) {
      signupError.textContent = "An email is required.";
      e.preventDefault();
      isValid = false;

      return;
    } else {
      if (!emailRegex.test(email)) {
        signupError.textContent = "Please enter a valid email address.";
        e.preventDefault();
        isValid = false;

        return;
      }
    }

    if (!password) {
      signupError.textContent = "Please create your password.";
      e.preventDefault();
      isValid = false;

      return;
    } else {
      if (password.length < 6) {
        signupError.textContent =
          "Password must be at least 6 characters long.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (!/[A-Z]/.test(password)) {
        signupError.textContent =
          "Password must contain at least one uppercase letter.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (!/[a-z]/.test(password)) {
        signupError.textContent =
          "Password must contain at least one lowercase letter.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (!/[0-9]/.test(password)) {
        signupError.textContent = "Password must contain at least one number.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        signupError.textContent =
          "Password must contain at least one special character.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (/\s/.test(password)) {
        signupError.textContent = "Password must not contain spaces.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (/(.)\1{2,}/.test(password)) {
        signupError.textContent =
          "Password must not contain more than two identical characters in a row. E.g., 'aaa' or '111'.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (/(012|123|234|345|456|567|678|789|890)/.test(password)) {
        signupError.textContent =
          "Password must not contain sequences of three or more consecutive numbers. E.g., '012' or '789'.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (
        /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
          password,
        )
      ) {
        signupError.textContent =
          "Password must not contain sequences of three or more consecutive letters. E.g., 'abc' or 'xyz'.";
        e.preventDefault();
        isValid = false;

        return;
      }
      if (
        /(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn)/i.test(
          password,
        )
      ) {
        signupError.textContent =
          "Password must not contain common keyboard patterns. E.g., 'qwe' or 'asd'.";
        e.preventDefault();
        isValid = false;

        return;
      }
    }
  }

  if (isValid) {
    signupError.textContent = "";
  } else {
    e.preventDefault();
  }
});

function togglePasswordVisibility() {
  const passwordInput = document.getElementById("signupPassword");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "Show";
  }
}

togglePassword.addEventListener("click", togglePasswordVisibility);

function clearErrors() {
  loginError.textContent = "";
  signupError.textContent = "";
}
