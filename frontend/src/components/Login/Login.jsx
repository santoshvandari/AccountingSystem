import React from 'react'
import InputField from '../InputField/InputField'

const Login = () => {
  return (
            <div>
              <InputField label="Email" type="email" />
              <InputField label="Password" type="password" />
            </div>
  )
}

export default Login
