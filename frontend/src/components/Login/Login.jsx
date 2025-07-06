import React from 'react'
import InputField from '../InputField/InputField'
import Heading from '../Heading/Heading'
import Button from '../Button/Button'

const Login = () => {
    return (
        <>
            <Heading text="Login" level={1} />
            <div>
                <InputField label="Email" type="email" />
                <InputField label="Password" type="password" />
            </div>
            <div className="mt-4">
                <Button label="Login" onClick={() => { }} />
            </div>
        </>
    )
}

export default Login;
