const out = document.getElementById('output');

let accessToken = null;


// =========================
// SHOW OUTPUT
// =========================

function show(title, data) {
  out.textContent =
    title + '\n\n' +
    JSON.stringify(data, null, 2);
}


// =========================
// API HELPER
// =========================

async function api(path, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Add JWT access token
    if (accessToken) {
      headers.Authorization = 'Bearer ' + accessToken;
    }

    const response = await fetch(path, {
      ...options,
      credentials: 'include',
      headers
    });

    const data = await response.json().catch(() => ({
      message: 'Invalid server response'
    }));

    return {
      status: response.status,
      data
    };

  } catch (error) {
    return {
      status: 0,
      data: {
        message: 'Could not connect to server',
        error: error.message
      }
    };
  }
}


// =========================
// LOGIN
// =========================

document.getElementById('loginBtn').addEventListener('click', async () => {

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    show('LOGIN', {
      message: 'Please enter email and password'
    });

    return;
  }

  const result = await api('/api/v1/auth/login', {
    method: 'POST',

    body: JSON.stringify({
      email: email,
      password: password
    })
  });

  if (result.data.accessToken) {
    accessToken = result.data.accessToken;
  }

  show(
    'LOGIN → ' + result.status,
    result.data
  );
});


// =========================
// REFRESH TOKEN
// =========================

document.getElementById('refreshBtn').addEventListener('click', async () => {

  const result = await api('/api/v1/auth/refresh', {
    method: 'POST'
  });

  if (result.data.accessToken) {
    accessToken = result.data.accessToken;
  }

  show(
    'REFRESH → ' + result.status,
    result.data
  );
});


// =========================
// GET EMPLOYEE PROFILE
// =========================

document.getElementById('profileBtn').addEventListener('click', async () => {

  const result = await api('/api/v1/employee/profile');

  show(
    'PROFILE → ' + result.status,
    result.data
  );
});


// =========================
// APPROVE PAYROLL
// =========================

document.getElementById('payrollBtn').addEventListener('click', async () => {

  const result = await api('/api/v1/payroll/approve', {
    method: 'POST'
  });

  show(
    'PAYROLL → ' + result.status,
    result.data
  );
});


// =========================
// LOGOUT
// =========================

document.getElementById('logoutBtn').addEventListener('click', async () => {

  const result = await api('/api/v1/auth/logout', {
    method: 'POST'
  });

  accessToken = null;

  show(
    'LOGOUT → ' + result.status,
    result.data
  );
});


// =========================
// GOOGLE OAUTH
// =========================

const params = new URLSearchParams(
  window.location.search
);


// Google Login Success

if (params.get('login') === 'success') {

  show('GOOGLE LOGIN', {
    message: 'Google authentication successful'
  });

  api('/api/v1/auth/refresh', {
    method: 'POST'
  }).then((result) => {

    if (result.data.accessToken) {
      accessToken = result.data.accessToken;
    }

    show(
      'OAUTH LOGIN SUCCESS → ' + result.status,
      result.data
    );

  });
}


// Google Login Failed

if (params.get('error') === 'oauth_failed') {

  show('GOOGLE LOGIN FAILED', {
    message: 'Google authentication failed'
  });
}