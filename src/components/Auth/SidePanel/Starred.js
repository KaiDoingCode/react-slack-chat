import React from "react";
import {Menu, Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../../actions';
import firebase from "../../../firebase.js";

class Starred extends React.Component {

    state = {
        user: this.props.currentUser,
        usersRef: firebase.database().ref('users'),
        activeChannel: '',
        starredChannels: []
    }

    setActiveChannel = channel => {
        this.setState({activeChannel: channel.id});
    }

    changeChannel = channel => {
        this.setActiveChannel(channel)
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    }

    componentDidMount(){
        if(this.state.user)
        this.addListeners(this.state.user.uid);
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    removeListeners = () => {
        this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
    }

    addListeners = userId => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_added', snap => {
                const starredChannel = {id: snap.key, ...snap.val()};
                this.setState({
                    starredChannels: [...this.state.starredChannels, starredChannel] 
                })
            })

        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_removed', snap => {
                const channelToRemove = {id: snap.key, ...snap.val()};
                const filterChannels = this.state.starredChannels.filter(channel => channel.id !== channelToRemove.id);
                this.setState({
                    starredChannels: filterChannels
                }) 
            })
    }

    displayChannels = starredChannels => {
        return  (
            <div>
                {starredChannels.length > 0 &&
                starredChannels.map(channel => {
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
                            
                            # {channel.name}
                        </Menu.Item>
                    );
                })}
            </div>
        );
    }

    render(){
        const {starredChannels} = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="star"></Icon>STARRED
                    </span>{" "}
                    ({starredChannels.length}) 
                </Menu.Item>
                {starredChannels.length > 0 && this.displayChannels(starredChannels)}
            </Menu.Menu>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred);