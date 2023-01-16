import React from 'react';
import firebase from '../../../firebase.js'; 
import {Icon, Menu, Modal, Form, Input, Button, Label} from 'semantic-ui-react';

import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../../actions';

class Channels extends React.Component{
    state={
        user: this.props.currentUser,
        channels: [],
        modal: false,
        channelDetails: '',
        channelsRef: firebase.database().ref("channels"),
        channelName: '',
        firstLoad: true,
        activeChannel: '',
        channel: null,
        messagesRef: firebase.database().ref('messages'),
        notifications: [],
        typingRef: firebase.database().ref('typing')
    }

    componentDidMount(){
        this.addListeners();
        
    }

    removeListeners = () => {
        this.state.channelsRef.off(); 
        this.state.channels.forEach(channel => {
            this.state.messagesRef.child(channel.id).off();
        })
    }

    componentWillUnmount(){
        this.removeListeners();
    }



    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({channel: firstChannel});
        }
        this.setState({firstLoad: false});

        
    }

    handleNotification = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index = notifications.findIndex(notification => notification.id === channelId);

        if(index !== -1){
            if(channelId !== currentChannelId){
                lastTotal = notifications[index].total;

                if(snap.numChildren() -lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            });
        }

        this.setState({notifications});
    }

    addNotificationListeners = channelId => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if(this.state.channel) {
                this.handleNotification(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            // console.log(loadedChannels);
            // console.log(this.state.channels);
            this.setState({channels: loadedChannels}, ()=> {
                this.setFirstChannel();
            });
            this.addNotificationListeners(snap.key);
        })
    }

    openModal = () => {
        this.setState({modal: true});
    }

    closeModal = () => {
        this.setState({modal: false});
    }

    isFormValid = ({channelName, channelDetails}) => {
        return channelName && channelDetails;
    }

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    }

    addChannel = () => {
        const {channelsRef, channelName, channelDetails, user} = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(()=>{
                this.setState({channelName: '', channelDetails: ''});
                this.closeModal();
            })
            .catch(err => {
                console.log(err);
            })
    }

    setActiveChannel = channel => {
        this.setState({activeChannel: channel.id});
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => {
            return notification.id === this.state.channel.id
        });

        if(index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({notifications: updatedNotifications});

        }
    }
    
    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.state.typingRef
            .child(this.state.channel.id)
            .child(this.state.user.uid)
            .remove();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({channel});
        this.clearNotifications();
    }

    getNotificationCount = channel => {
        let count = 0;

        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id){
                count = notification.count;
            }
        });

        if(count > 0) return count;

    }

    displayChannels = channels => {
        return  (
            <div>
                {channels.length > 0 &&
                channels.map(channel => {
                    return(
                        <Menu.Item
                            key={channel.id}
                            onClick={() => {
                                this.changeChannel(channel)
                            }}
                            name={channel.name}
                            style={{opacity: 0.7}}
                            active={channel.id === this.state.activeChannel}
                        >
                            {this.getNotificationCount(channel) && (
                                <Label color="red">{this.getNotificationCount(channel)}</Label>
                            )}
                            # {channel.name}
                        </Menu.Item>
                    );
                })}
            </div>
        );
    }

   


    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid(this.state)){
            console.log('channel added');
            this.addChannel();
        }
    }

    render(){
        const {modal, channels} = this.state;

        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange"></Icon>CHANNELS
                        </span>{" "}
                        ({channels.length}) <Icon name="add" onClick={this.openModal}></Icon>
                    </Menu.Item>
                    {channels.length > 0 && this.displayChannels(channels)}
                </Menu.Menu>     

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>
                        Add a channel
                    </Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input fluid
                                label="Name of Channel"
                                name="channelName"
                                onChange={this.handleChange}
                                />
                            </Form.Field>
                        
                            <Form.Field>
                                <Input fluid
                                label="About the Channel"
                                name="channelDetails"
                                onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" /> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
            

        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels); 