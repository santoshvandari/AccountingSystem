import './App.css'
import InputField from './components/InputField/InputField'

function App() {
  return (
    <>
      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
      />
    </>
  )
}

export default App
