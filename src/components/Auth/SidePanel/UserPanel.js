import firebase from "../../../firebase.js";
import React from "react";
import AvatarEditor from "react-avatar-editor";
import {Dropdown, Grid, GridRow, Header, Icon, Image, Modal, Input, Button} from 'semantic-ui-react';


class UserPanel extends React.Component{

    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        croppedImage: '',
        blob: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        metadata: {
            contentType: 'image/jpeg'
        },
        uploadedCroppedImage: '',
        usersRef: firebase.database().ref('users')
    }

    openModal = () => {
        this.setState({modal: true});
    }

    closeModal = () => {
        this.setState({modal: false});
    }

    // componentDidMount(){
    //     this.setState({user: this.props.currentUser});
    // }

    // componentWillReceiveProps(nextProps){
    //     this.setState({user: nextProps.currentUser});
    // }

    handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(()=> {
                console.log('Sign Out');
            })
    }

    handleCropImage = () => {
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                console.log('blob', blob);
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                })
            })
        }
    }

    handleChange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if(file){
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                this.setState({previewImage: reader.result})
            })
        }
    }

    uploadCroppedImage = () => {
        const  {storageRef,userRef, blob, metadata} = this.state;
        // console.log('userRef', userRef);
        // console.log(`avatars/user-${userRef}`);
        storageRef
            // .child(`avatars/user-${this.state.user.uid}`)
            //userRef.uid === this.state.user.uid
            .child(`avatars/user/${userRef.uid}`)
            .put(blob, metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                    this.setState({uploadedCroppedImage: downloadURL}, ()=> {
                        this.changeAvatar()
                    })
                })
            })
    }
    
    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadedCroppedImage
            })
            .then(() => {
                this.closeModal();
            })
            .catch(err => {
                console.log(err);
            })

        this.state.usersRef
            .child(this.state.user.uid)
            .update({
                avatar: this.state.uploadedCroppedImage
            })
            .then(() => {
                 console.log('User Avatar Updated');
            })
            .catch(err => {
                console.log(err);
            })
    }

    dropdownOption = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span onClick={this.openModal}>Change Avatar</span>
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignOut}>Sign Out</span>
        }
    ]
    render(){
        // console.log(this.props.currentUser);
        const {user, modal, previewImage, croppedImage, blob, metadata} = this.state;
        console.log(user.photoURL);

        return(
            <Grid style={{background: this.props.primaryColor}} >
                <Grid.Column>
                    <Grid.Row style={{padding: '1.2em', margin: 0}}>
                        {/*App Header*/}
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>Slack</Header.Content>
                        </Header>
                    </Grid.Row>  
                    <Grid.Row>
                        {/*User Dropdown*/}
                        <Header style={{padding: '0.25em'}} as="h4">
                            <Dropdown style={{color: 'white', fontWeight: 'bolder'}} trigger={
            
                                <span style={{color: 'white', fontWeight: 'bolder'}}>
                                    <Image src={user.photoURL} spaced="right" avatar />
                                    {this.state.user.displayName}
                                </span>
                        
                            } 
                                options={this.dropdownOption()} 
                            />
                        </Header>
                    </Grid.Row>
                    {/*Change user avatar*/}
                    <Modal basic open={modal} onClose={this.closeModal} >
                        <Modal.Header>
                            Change avatar
                        </Modal.Header>
                        <Modal.Content>
                            <Input
                                fluid
                                type="file"
                                label="New Avatar"
                                name="previewImage"
                                onChange={this.handleChange}
                            />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid">
                                        {previewImage && (
                                            <AvatarEditor  
                                                ref={node => {
                                                    // console.log(node);
                                                    return this.avatarEditor = node;
                                                }} 
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {croppedImage && (
                                            <Image
                                                style={{margin: '3.5em auto'}}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                            />
                                        )}

                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && <Button color="green" inverted onClick={this.uploadCroppedImage}>
                                <Icon name="save" />Change Avatar
                            </Button>}
                            <Button color="green" inverted onClick={this.handleCropImage}>
                                <Icon name="image" />Preview
                            </Button>
                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove" />Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        )
    }
}


export default UserPanel;