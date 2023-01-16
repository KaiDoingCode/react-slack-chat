import React from "react";
import firebase from '../../firebase.js';
import md5 from "md5";

import {Grid, Form, Segment, Button, Header, Message, Icon, GridColumn} from 'semantic-ui-react';

import {Link} from 'react-router-dom';

class Register extends React.Component{
    constructor(props){
        super(props);
        // this.state={};
    }
    state={
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    }

    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length;
    }

    isPasswordValid = ({password, passwordConfirmation}) => {
        if(password.length < 6 || passwordConfirmation.length < 6){
            return false;
        } else if (password !== passwordConfirmation){
            return false;
        } else{
            return true;
        }
    }

    isFormValid = () => {

        let errors = [];

        let error;
        if(this.isFormEmpty(this.state)){
            error = {message: 'Please dont leave any field empty'}
            this.setState({ errors: errors.concat(error) });
            return false;
        } else if(!this.isPasswordValid(this.state)){
            error = {message: 'Password should be at least 6 character long, and the confirm password should be matched.'};
            this.setState({errors: errors.concat(error)});
            return false;
        } else{
            return true;
        }
    }

    displayErrors = errors => {
        return errors.map((error, index) => <p key={index}>{error.message}</p>)
    }

    saveUser = createdUser => {
        return this.state.usersRef.child(createdUser.user.uid).set({
          name: createdUser.user.displayName,
          avatar: createdUser.user.photoURL
        });
      };

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid()) {
          this.setState({ errors: [], loading: true });
          firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(createdUser => {
                console.log(createdUser);
                createdUser.user
                    .updateProfile({
                    displayName: this.state.username,
                    photoURL: `http://gravatar.com/avatar/${md5(
                        createdUser.user.email
                    )}?d=identicon`
                    })
                    .then(() => {
                        this.saveUser(createdUser).then(() => {
                            console.log("user saved");
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            loading: false
                        });
                    });
            })
            .catch(err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    loading: false
                });
            });
        }
    };

    handleInputError = (errors, inputName) => {
        return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'error' : ''
    }

    render(){

        const {username, email, password, passwordConfirmation, loading} = this.state;

        return (
            <Grid textAlign="center"  verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: "450px"}}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece">
                        </Icon>
                        Register for SlackChat
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input fluid name="username" icon="user" iconPosition="left"
                            placeholder="Username" onChange={this.handleChange} type="text" value={username}
                            ></Form.Input>
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
                            <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
                            placeholder="Password Confirmation" onChange={this.handleChange} type="password" value={passwordConfirmation}
                            // className = {this.state.errors.some(error => error.message.toLowerCase().includes('password')) ? 'error' : ''}
                            className={this.handleInputError(this.state.errors, 'password')}
                            ></Form.Input>
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {this.state.errors.length > 0 && (
                        <Message error>
                            <h3>Errors</h3>
                            {this.displayErrors(this.state.errors)}
                        </Message>
                    )}
                    <Message>Already a user? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;