import React from "react";
import {Menu} from 'semantic-ui-react';
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

class SidePanel extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        const { currentUser } = this.props;

        return(
           <Menu size="small"
            inverted
            fixed="left"
            vertical
            style={{background: this.props.primaryColor, fontSize: '1.2rem' }}
           >
               <UserPanel primaryColor={this.props.primaryColor} currentUser={currentUser}></UserPanel>
               <Starred currentUser={currentUser} />
               <Channels currentUser={currentUser}></Channels>
               <DirectMessages currentUser={currentUser} />
           </Menu>
        )
    }
}

export default SidePanel;