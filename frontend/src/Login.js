import React from 'react'

function Login() {

  const login = async () => {
    const response = await fetch('/auth/login');
    if (response.ok) {
        window.location.href = response.url;
    } else {
      console.error('login failes', response.status)
    }
};

  return (
    <div className="App">
      <button onClick={login}>Login with Spotify</button>
    </div>
  )
}

export default Login
