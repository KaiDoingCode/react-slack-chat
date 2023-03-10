import React from "react";
import moment from "moment";
import { Comment,Image } from 'semantic-ui-react';

const isOwnedMessage = (message, user) => {
    return (message.user.id === user.uid) ? 'message__self' : '';
}

const timeFromNow = timestamp => {
    return moment(timestamp).fromNow();
};

const isImage = (message) => {
    return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
}

const Message = ({message, user}) => (
    <Comment>
        <Comment.Avatar src={message.user.avatar}></Comment.Avatar>
        <Comment.Content className={isOwnedMessage(message, user)}>
            <Comment.Author as="a">{message.user.name}</Comment.Author>
            <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
            {isImage(message) ? <Image src={message.image} className="message__image" /> : <Comment.Text>{message.content}</Comment.Text> }
        </Comment.Content>
    </Comment>
)

export default Message;