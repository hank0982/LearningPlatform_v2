import React, { Component}  from 'react';
import { Button, Form, Tab, Grid, Segment, Header, Icon, Label, Divider } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import Intro from './intro'
import CompanyIntro from './companyIntro'
import BusinessOpAnalysis from './businessOpAnalysis'
import CompetitorAnalysis from './competitorAnalysis'
import GameForm from './form'
class GameStart extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };
    constructor(props){
        super(props);
        this.state = {
            redirect: false
        }
    }
    redirectTo(path){
        this.setState({
            redirect: true,
            redirectTo: path
        })
    }
    componentWillMount(){
        const that = this;
        const { cookies, firebase } = this.props;
        const roomNum = cookies.get('roomNum') || null
        const groupNum = cookies.get('groupNum') || null
        if(!(roomNum) && !(groupNum)) {
            this.redirectTo('/')
        }else{
            this.setState({
                roomNum,
                groupNum
            })
            firebase.getCompanyListener(roomNum, groupNum, (companyInfo)=>{
                that.setState({
                    companyInfo
                })
            })
            firebase.getRoomInfo(roomNum, (roomInfo) =>{
                that.setState({roomInfo})
            })
            firebase.getCompanyName(roomNum, groupNum).then((companyName) => {
                that.setState({companyName})
                firebase.getCurrentRound(roomNum, (currentRound)=>{
                    that.setState({currentRound})
                    firebase.isEndSession(roomNum, (endSession) => {
                        that.setState({endSession})
                    })
                })
            })
                
        }
        
    }
    render(){
        const { roomInfo, groupNum, roomNum, currentRound, endSession, companyName, companyInfo} = this.state;
        const { marketType, firmNum } = roomInfo || {marketType: null, firmNum: null};
        const { firebase } = this.props;
        const panes = [
            { menuItem: 'Game Intro', render: () => 
                {
                    return ( roomInfo ? 
                    <Tab.Pane style={{height: '500px', overflowY: 'scroll'}}>
                        <Intro 
                        gameRule = {roomInfo['gameRule']} 
                        desOfFirms={roomInfo['descriptionOfFirms']} 
                        marketDes={roomInfo['marketDescription']} 
                        goalOfFirms={roomInfo['goalOfFirms']}
                        />
                    </Tab.Pane> : <Tab.Pane loading></Tab.Pane>
                    )
                }
            },
            { menuItem: 'Company Intro', render: () => <Tab.Pane style={{height: '500px', overflowY: 'scroll'}}>
                <CompanyIntro 
                    companyInfo={companyInfo}
                />
                </Tab.Pane> },
            { menuItem: 'Anaylsis', render: () => (<Tab.Pane style={{height: '500px', overflowY: 'scroll'}}>
                <BusinessOpAnalysis 
                    firebase={firebase} 
                    groupNum={groupNum} 
                    roomNum={roomNum} 
                    roundNum={endSession ? currentRound : currentRound - 1} 
                    marketType={marketType}
                />
                <Divider/>
                <CompetitorAnalysis
                    firebase = {firebase}
                    firmNum = {firmNum}
                    roomNum = {roomNum}
                    roundNum={endSession ? currentRound : currentRound - 1} 
                />
            </Tab.Pane>) },
        ]
        if(this.state.redirect) return <Redirect to={this.state.redirectTo}/>
        return(
            <Segment secondary className='background'>
                <Grid relaxed doubling container stackable columns='2' verticalAlign='middle'  className='background'>
                    <Grid.Row>
                    <Grid.Column floated='left' >
                        <div >
                            <Tab panes={panes}/>
                        </div>
                    </Grid.Column>
                    <Grid.Column floated='right' >
                        <div>
                            {currentRound && <GameForm 
                                roomInfo={roomInfo}
                                firebase={firebase} 
                                groupNum={groupNum} 
                                roomNum={roomNum}
                                currentRound={currentRound}
                            />}
                        </div>
                    </Grid.Column>
                    </Grid.Row>
                    <Grid.Row textAlign='center' centered>
                        <Label color='red'>
                            Room Num
                            <Label.Detail>{roomNum}</Label.Detail>
                        </Label>
                        <Label color='green'>
                            Company
                            <Label.Detail>{companyName}</Label.Detail>
                        </Label>
                        <Label color='blue'>
                            Round
                            <Label.Detail>
                                {roomInfo && roomInfo.roundNum}
                            </Label.Detail>
                        </Label>
                    </Grid.Row>
                </Grid>
            </Segment> 
        );
        
    }
}

export default withCookies(GameStart);