import React, { Component}  from 'react';
import { Button, Form, Tab, Grid, Segment, Header, Icon, Message} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class Home extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };
    constructor(props){
        super(props);
        this.state = {
            roomNum: '',
            password: '',
            groupNum: '',
            message: '',
            un_set: true,
            redirectTo: '/'
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.showErrorMessage = this.showErrorMessage.bind(this);
        this.redirectTo = this.redirectTo.bind(this);
    }
    componentWillMount(){
        const { cookies } = this.props;
        this.setState({
            roomNum: cookies.get('roomNum', { path: '/' }) || '',
            groupNum: cookies.get('groupNum', { path: '/' }) || ''
        },()=>{
            console.log(this.state)
        })
    }
    showErrorMessage(message){
        this.setState({
            message,
        })
    }
    redirectTo(path){
        this.setState({
            un_set: false,
            redirectTo: path
        })
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
          [name]: value
        });
    }
    handleSubmit(event) {
        event.preventDefault()
        const { cookies, firebase} = this.props;
        const { roomNum, groupNum } = this.state
        const that = this;
        const { name } = event.target;
        const target = event.target;
        cookies.set('roomNum', roomNum, { path: '/' });
        cookies.set('groupNum', groupNum, { path: '/' });
        console.log(`Form ${target.name} submitted`);
        if(name === 'student'){
            if(roomNum.length >= 1 && groupNum.length >= 1 ){
                firebase.isRoomExist(this.state.roomNum, this.state.groupNum).then((result)=>{
                    if(result) that.redirectTo('/game_start')
                }).catch((err)=>{
                    that.showErrorMessage(err.message)
                })
            }else{
                that.showErrorMessage('Please provide sufficient data.')
            }
        }
    }
    renderStudentPane = () => {
        return (
            <Tab.Pane>
                <Form onSubmit={this.handleSubmit} name='student'>
                    <Form.Field>
                    <label>Room Number</label>
                    <input value={this.state.roomNum || ''} onChange={this.handleInputChange} name="roomNum" placeholder='Please Enter The Room Number' />
                    </Form.Field>
                    <Form.Field>
                    <label>Group Number</label>
                    <input value={this.state.groupNum || ''} onChange={this.handleInputChange} name="groupNum" placeholder='Please Enter The Group Number' />
                    </Form.Field>
                    <Button type='submit' fluid color='teal'> Submit</Button>
                </Form>
            </Tab.Pane> 
        )
    }
    renderTeacherPane = () => {
        return (
            <Tab.Pane>
                    <Form onSubmit={this.handleSubmit} name='teacher'>
                        <Form.Field>
                        <label>Room Number</label>
                        <input value={this.state.roomNum || ''} onChange={this.handleInputChange} name="roomNum" placeholder='Please Enter The Room Number' />
                        </Form.Field>
                        <Form.Field>
                        <label>Password</label>
                        <input value={this.state.password || ''} onChange={this.handleInputChange} name="password" type='password' placeholder='Please Enter Your Password' />
                        </Form.Field>
                        <Button type='submit' fluid color='teal'>Submit</Button>
                    </Form>
            </Tab.Pane> 
        )
    }
    render(){
        const panes = [
            { menuItem: 'Student', render: () => this.renderStudentPane() },
            { menuItem: 'Teacher', render: () => this.renderTeacherPane() },
            { menuItem: 'About', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
          ]
        if(this.state.un_set){
            return(
                <Segment secondary style={{height:'100%'}} >
                    <Grid stackable verticalAlign='middle' centered columns={2} container style={{height:'100%'}} >
                        <Grid.Column>
                            <Header textAlign='center' color='teal'>
                                <Icon name='graduation cap'/>
                                CUHK Business Platform   
                            </Header>
                            <Segment>
                                <Tab panes={panes} />
                            </Segment>
                            <Message hidden = { this.state.message.length === 0 } attached='bottom' error>
                                <Icon name='dont' />
                                {this.state.message}
                            </Message>
                        </Grid.Column>
                    </Grid>
                </Segment> 
            );
        }else{
            return <Redirect to={this.state.redirectTo}/>
        }
    }
}

export default withCookies(Home);