import React from "react";

import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react';
import {SliderPicker} from 'react-color';
import firebase from "../../../firebase.js";
import {setColors} from '../../../actions';

import {connect} from 'react-redux';

class ColorPanel extends React.Component{
    constructor(props){
        super(props);
    }

    state={
        modal: false,
        primary: '',
        secondary: '',
        usersRef: firebase.database().ref('users'),
        user: this.props.currentUser,
        userColors: []
    }

    componentDidMount(){
        if(this.state.user){
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    removeListeners = () => {
        this.state.usersRef.child(`${this.state.user.uid}/colors`).off();
    }

    addListener = userId => {
        let userColors = [];
        this.state.usersRef
            .child(`${userId}/colors`)
            .on('child_added', snap => {
                userColors.unshift(snap.val());
                this.setState({
                    userColors: userColors
                })
            })
    }

    openModal = () => {
        this.setState({modal: true});
    }

    closeModal = () => {
        this.setState({modal: false});
    }

    handleChangePrimary = color => this.setState({primary: color.hex});

    handleChangeSecondary = color => this.setState({secondary: color.hex});

    saveColor = (primary, secondary) => {

        this.state.usersRef
            .child(`${this.state.user.uid}/colors`)
            .push()
            .update({
                primary: primary,
                secondary: secondary
            })
            .then(()=> {
                console.log('Colors added');
                this.closeModal();
            })
            .catch(err => {
                console.log(err);
            })
    }

    handleSaveColor = () => {
        if(this.state.primary && this.state.secondary){
            this.saveColor(this.state.primary, this.state.secondary);
        }
    }

    displayUserColors = colors => (
        colors.length > 0 && colors.map((color, i) => (
            <React.Fragment key={i}>
                <Divider />
                <div className="color__container"
                    onClick={()=> {
                        this.props.setColors(color.primary, color.secondary)
                    }}
                >
                    <div className="color__square" style={{background: color.primary}}>
                        <div className="color__overlay" style={{background: color.secondary}}>

                        </div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )

    render(){

        const {userColors, modal, primary, secondary} = this.state;
        return(
            <Sidebar
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin"
            >
                <Divider></Divider>
                <Button icon="add" size="small" color="blue" onClick={this.openModal}></Button>
                {userColors.length > 0 && this.displayUserColors(userColors)}

                {/*Color pickle*/}
                <Modal basic open={this.state.modal} onClose={this.closeModal}>
                    <Modal.Header>
                        Choose App color
                    </Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content="Please pick primary color for the app" />
                            <SliderPicker color={primary} onChange={this.handleChangePrimary} /> 
                        </Segment>
                        <Segment inverted>
                            <Label content="Please pick the second color as the sub-color" />
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSaveColor}>
                            <Icon name="checkmark"></Icon> Save Color
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"></Icon> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        )
    }
}

export default connect(null, {setColors})(ColorPanel);