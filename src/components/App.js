import React, { Component } from 'react';
import {Grid, GridColumn, Message} from 'semantic-ui-react';
import './App.css';

import ColorPanel from './Auth/ColorPanel/ColorPanel';
import SidePanel from './Auth/SidePanel/SidePanel';
import MetalPanel from './Auth/MetalPanel/MetalPanel';
import Messages from './Auth/Messages/Messages';

import {connect} from 'react-redux';

const App = ({currentUser, currentChannel, isPrivate, userPosts, primaryColor, secondaryColor}) => {
  
    return (
      <Grid columns="equal" className="app" style={{background: secondaryColor}}>
        <ColorPanel 
          key={currentUser && currentUser.name} 
          currentUser={currentUser}
        
        ></ColorPanel>
        <SidePanel 
          key={currentUser && currentUser.uid}
          currentUser={currentUser}
          primaryColor={primaryColor}
        ></SidePanel>
        <Grid.Column style={{marginLeft: 320}}>
          <Messages
            key={currentChannel && currentChannel.id}
            currentChannel={currentChannel}
            currentUser={currentUser}
            isPrivateChannel={isPrivate}
          ></Messages>
        </Grid.Column>

        <Grid.Column width={4}>
          <MetalPanel
            key={currentChannel && currentChannel.name}
            userPosts={userPosts}
            isPrivateChannel={isPrivate}
            currentChannel={currentChannel}
          ></MetalPanel>
        </Grid.Column>
        
      </Grid>
      
    );
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivate: state.channel.isPrivate,
  userPosts: state.channel.userPosts,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor
})

export default connect(mapStateToProps)(App);
