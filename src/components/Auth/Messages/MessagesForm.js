import React from "react";
import { Segment, Button, Input } from 'semantic-ui-react';
import FileModal from "./FileModal.js";
import firebase from "../../../firebase.js";
import { v4 as uuidv4 } from 'uuid';
import ProgressBar from "./ProgressBar.js";
import {Picker, emojiIndex} from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

class MessagesForm extends React.Component {
    state={
        message: '',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        loading: false,
        errors: [],
        modal: false,
        uploadState: '',
        uploadTask: 'null',
        storageRef: firebase.storage().ref(),
        percentUploaded: 0,
        typingRef: firebase.database().ref('typing'),
        emojiPicker: false
    }

    componentWillUnmount(){
        if(this.state.uploadTask !== null) {
            // this.state.uploadTask.cancel();
            this.setState({uploadTask: null});
        }
    }

    openModal = () => {
        this.setState({modal: true});
    }

    closeModal = () => {
        this.setState({modal: false});
    }

    handleChange = event => {
        
        this.setState({[event.target.name]: event.target.value });
    }

    handleKeyDown = event => {
        if (event.keyCode == 13) {
            this.sendMessage();
        }

        const {message, typingRef, channel, user} = this.state;
        if(message){
            typingRef.child(channel.id)
                .child(user.uid)
                .set(user.displayName)
        } else{
            typingRef.child(channel.id)
                .child(user.uid)
                .remove();
        }
    }

    createMessage  = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },  
            // content: this.state.message
        };
        if(fileUrl !== null){
            message['image'] = fileUrl;

        }else{
            message['content'] = this.state.message;
        }

        return message;
    }

    sendMessage = event => {
        // event.preventDefault();
        const {getMessagesRef} = this.props;
        const {message, channel, user, typingRef} = this.state;

        if(message){
            this.setState({loading: true});
            getMessagesRef().child(channel.id)
            .push()
            .set(this.createMessage())
            .then(()=> {
                this.setState({loading: false, message: '', errors: []});
                typingRef.child(channel.id)
                    .child(user.uid)
                    .remove();
            })
            .catch(err => {
                console.log(err);
                this.setState({
                    loading: false,
                    errors: this.state.errors.concat(err)
                });
            })
        } else {
            this.setState({
                errors: this.state.errors.concat({message: 'Please add a message'})
            });
        }
    }

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
        .push()
        .set(this.createMessage(fileUrl))
        .then(()=> {
            this.setState({uploadState: 'done'})
        })
        .catch(err => {
            console.log(err);
            this.setState({
                errors: this.state.errors.concat(err)
            })
        })
    }
    
    getPath = () => {
        if(this.props.isPrivateChannel){
            return `chat/private/${this.state.channel.id}`;
        } else {
            return `chat/public`;
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();

        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        }, () => {
            this.state.uploadTask.on('state_changed', snap => {
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes)*100);
                this.props.isProgressBarVisible(percentUploaded);
                this.setState({percentUploaded: percentUploaded});
            }, err => {
                console.log(err);
                this.setState({errors: this.state.errors.concat(err),
                    uploadState: 'error',
                    uploadTask: null
                })
            }, () => {
                this.state.uploadTask.snapshot.ref
                    .getDownloadURL()
                    .then(downloadUrl => {
                        this.sendFileMessage(downloadUrl, ref, pathToUpload);
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: "error",
                        uploadTask: null
                        });
                    });
            })
        })
    }

    handleTogglePicker = () => {
        this.setState({emojiPicker: !this.state.emojiPicker});
    }

    handleAddEmoji = emoji => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
        this.setState({message: newMessage, emojiPicker: false});
        setTimeout(() => {
            this.messageInputRef.focus()
        }, 0);
    }

    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
          x = x.replace(/:/g, "");
          let emoji = emojiIndex.emojis[x];
          if (typeof emoji !== "undefined") {
            let unicode = emoji.native;
            if (typeof unicode !== "undefined") {
              return unicode;
            }
          }
          x = ":" + x + ":";
          return x;
        });
    };



    render(){
        const {errors, message, loading, modal, uploadState, percentUploaded, emojiPicker} = this.state;

        return(
            <Segment className="message__form" >
                {emojiPicker && (
                    <Picker
                        set="apple"
                        onSelect={this.handleAddEmoji}
                        className="emojipicker"
                        title="Pick your emoji"
                        emoji="point_up"
                    >
                    </Picker>
                )}
                <Input 
                    value={this.state.message}
                    fluid
                    name="message"
                    style={{marginBottom: '0.7em'}}
                    label={
                    <Button 
                        icon={emojiPicker ? "close" : "add"}
                        content={emojiPicker ? 'Close' : null}
                        onClick={this.handleTogglePicker}

                    >
                        </Button>}
                    labelPosition="left"
                    placeholder="Write your message"
                    onKeyDown={this.handleKeyDown}
                    onChange={this.handleChange}
                    className={errors.length > 0 && errors.some(err => err.message.includes('message')) ? 'error' : '' }
                    ref={node => (this.messageInputRef=node )}
                    
                />
                <Button.Group icon widths="2" >
                    <Button
                        color="orange"
                        disabled={loading}
                        content="Add reply"
                        labelPosition="left"
                        icon="edit"
                        onClick={this.sendMessage}
                    />
                     <Button
                        color="teal"
                        content="Upload media"
                        labelPosition="right"
                        icon="cloud upload"
                        onClick={this.openModal}
                        disabled={uploadState === 'uploading'}
                    />
                    
                </Button.Group>
                <FileModal
                     modal={modal}
                     closeModal={this.closeModal}
                     uploadFile={this.uploadFile}
                />
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />
            </Segment>
        )
    }
};

export default MessagesForm;