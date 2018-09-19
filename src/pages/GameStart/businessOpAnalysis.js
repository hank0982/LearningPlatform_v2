import React, { Component}  from 'react';
import { Header, Card, Tab} from 'semantic-ui-react'
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import ReactChartkick, { LineChart } from 'react-chartkick'
import Chart from 'chart.js'
ReactChartkick.addAdapter(Chart)

class Anaylsis extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };
    constructor(props){
        super(props);   
        this.state = {}
    }
    componentWillMount(){
        const { firebase, roundNum, roomNum, groupNum, marketType} = this.props;
        firebase.getBusinessOperationData(roomNum, groupNum, roundNum, marketType).then((data)=>{
            console.log(data)
            this.setState(data)
        })
    }
    render(){
        const {unitCostPerRounds, profitPerRounds, revenuePerRounds, pricePerRounds} = this.state
        const panes = [
            { menuItem: 'Unit Price', render: () => (
                <Tab.Pane attached={false}>
                    <LineChart download={true}thousands="," xtitle="Round" curve={false} data={pricePerRounds}/>
                </Tab.Pane>) },
            { menuItem: 'Unit Cost', render: () => (
                <Tab.Pane attached={false}>
                    <LineChart download={true} thousands="," xtitle="Round" curve={false} data={unitCostPerRounds}/>
                </Tab.Pane>) },
            { menuItem: 'Profit', render: () => (
                <Tab.Pane attached={false}>
                    <LineChart download={true} thousands="," xtitle="Round" curve={false} data={profitPerRounds}/>
                </Tab.Pane>)},
            
            { menuItem: 'Revenue', render: () => (
                <Tab.Pane attached={false}>
                    <LineChart download={true} thousands="," xtitle="Round" curve={false} data={revenuePerRounds}/>
                </Tab.Pane>)},
          ]
        return(
            <div>
                <Header as='h2' color='teal'>
                    <Header.Content>Business Operation Analysis</Header.Content>
                    <Header.Subheader>Important Factors</Header.Subheader>
                </Header>
                <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
                
            </div>  
        );
        
    }
}

export default withCookies(Anaylsis);