import React from "react";
import firebase from '../../firebase.js';
import md5 from "md5";

import {Grid, Form, Segment, Button, Header, Message, Icon, GridColumn} from 'semantic-ui-react';

import {Link} from 'react-router-dom';

class Login extends React.Component{
    constructor(props){
        super(props);
    }

    state={
        email: '',
        password: '',
        errors: [],
        loading: false,
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    }

    displayErrors = errors => {
        return errors.map((error, index) => <p key={index}>{error.message}</p>)
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
          this.setState({ errors: [], loading: true });
          firebase.auth()
            .signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(signedInUser => {
                console.log(signedInUser);
            }).catch(err=> {
                console.log(err);
                this.setState({errors: this.state.errors.concat(err), loading: false})
            })
        }
    };

    isFormValid = ({email, password}) => {
        return email && password;
    }

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''
    }

    render(){
        const {email, password, loading, errors} = this.state;

        return (
            <Grid textAlign="center"  verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: "450px"}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="puzzle piece">
                        </Icon>
                        Login
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input fluid name="email" icon="mail" iconPosition="left"
                            placeholder="Email Address" onChange={this.handleChange} type="email" value={email}
                            // className = {this.state.errors.some(error => error.message.toLowerCase().includes('email')) ? 'error' : ''}
                            className={this.handleInputError(this.state.errors, 'email')}
                            ></Form.Input>
                            <Form.Input fluid name="password" icon="lock" iconPosition="left"
                            placeholder="Password" onChange={this.handleChange} type="password" value={password}
                            // className = {this.state.errors.some(error => error.message.toLowerCase().includes('password')) ? 'error' : ''}
                            className={this.handleInputError(this.state.errors, 'password')}
                            ></Form.Input>
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {this.state.errors.length > 0 && (
                        <Message error>
                            <h3>Errors</h3>
                            {this.displayErrors(this.state.errors)}
                        </Message>
                    )}
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Login;