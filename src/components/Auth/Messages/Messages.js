import React from "react";
import { Segment, Comment, MessageHeader } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessagesForm from "./MessagesForm";
import firebase from'../../../firebase.js';
import Message from './Message';
import { connect } from "react-redux";
import { setUserPosts } from "../../../actions";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

class Messages extends React.Component{
    constructor(props){
        super(props);
    }

    state={
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        messagesLoading: true,
        progressBar: false,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false, 
        searchResults: [],
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        isChannelStarred: false,
        usersRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected'),
        listeners: []
    }

    componentDidMount() {
        const {channel, user, listeners} = this.state;
        
        if(channel && user) {
            this.removeListeners(listeners)
            this.addListeners(channel.id);
            this.addUsersStarsListeners(channel.id, user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListeners(this.state.listeners);
        this.state.connectedRef.off();
    }

    removeListeners = listeners => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event);
        })
    }

    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event
        })

        if(index===-1){
            const newListener = {id, ref, event}
            this.setState({listeners: this.state.listeners.concat(newListener)});
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(this.messagesEnd){
            this.scrollToBottom();
        }
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({behavior: 'smooth'});
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId);
        this.addTypingListeners(channelId);
    }

    addTypingListeners = channelId => {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if(snap.key !== this.state.user.uid){
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({typingUsers});
            }
        })

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if(index !== -1){
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({typingUsers});
            }

        })

        this.state.connectedRef.on('value', snap => {
             if(snap.val() === true){
                 this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if(err!== null) console.log(err);
                    })
             }
        })

        this.addToListeners(channelId, this.state.typingRef, 'child_added');

    }

    addUsersStarsListeners = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if(data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    this.setState({isChannelStarred: prevStarred});
                }
            })
    }

    handleSearchMessage = () => {
        const channelMessage = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessage.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || message.user.name.match(regex)){
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({searchResults});
        setTimeout(() => {this.setState({searchLoading : false})}, 1000);
    }

    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, ()=> {
            this.handleSearchMessage();
        });
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
              acc.push(message.user.name);
            }
            return acc;
          }, []);
          const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
          const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
          this.setState({ numUniqueUsers });
    }

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    starChannel = () => {
        if(this.state.isChannelStarred){
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                });
        } else {
            this.state.usersRef 
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if(err!== null)
                    console.log(err);
                })
        }
    }

    handleStar = () => {
        this.setState(prevState => ({isChannelStarred: !prevState.isChannelStarred}),
        () => {
            this.starChannel();
        });
    }

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc){
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {});

        this.props.setUserPosts(userPosts);
    }

    addMessageListener = channelId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on("child_added", snap => {
            loadedMessages.push(snap.val());
            this.setState({
              messages: loadedMessages,
              messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        });

        this.addToListeners(channelId, ref, 'child_added');

    };
    
   

    displayMessages = messages => {
        return (
            <React.Fragment>
                {
                    messages.length > 0 && messages.map(message => (
                        <Message
                            key={message.timeStamp}
                            message={message}
                            user={this.state.user}
                        ></Message>
                    ))
                }
            </React.Fragment>
        )
        
    }

    isProgressBarVisible = percent => {
        if(percent > 0){
            this.setState({progressBar: true});
        }
    }

    displayChannelName = channel => {
        // return channel ? `#${channel.name}` : ''
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
    }

    displayTypingUsers = users =>
        users.length > 0 &&
        users.map(user => (
        <div
            style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
            key={user.id}
        >
            <span className="user__typing">{user.name} is typing</span> <Typing />
        </div>
    ));

    displayMessagesSkeleton = loading => (
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_,i) => (
                    <Skeleton key={i}></Skeleton>
                ))}
            </React.Fragment>
        ) : null
    )

    render(){
        const {messagesRef, messages,  channel, user, progressBar, 
            numUniqueUsers, searchTerm, searchLoading, 
            searchResults, privateChannel, isChannelStarred, typingUsers, messagesLoading} = this.state;
        return(
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                ></MessagesHeader>
                <Segment>
                    <Comment.Group className={progressBar ? "messages__progress" : "messages"}>
                    {this.displayMessagesSkeleton(messagesLoading)}
                    {/* {messages.length && !searchTerm > 0 && this.displayMessages(messages)} */}
                    {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node => {
                            this.messagesEnd = node
                        }}></div>
                    </div>
                    
                    </Comment.Group>
                </Segment>

                <MessagesForm 
                    messagesRef= {messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                ></MessagesForm>
            </React.Fragment>
        )
    }
}

export default connect(null, {setUserPosts})(Messages);