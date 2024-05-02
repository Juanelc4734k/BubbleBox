import React from 'react';
import ReactDOM from 'react-dom';
import Login from './components/Login';
import Register from './components/register';

function App() {
  return (
    <div>
      <Login/>
      <Register/>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
