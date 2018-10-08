import React, { Component}  from 'react';
import { Header, Card, Tab, Segment} from 'semantic-ui-react'
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import ReactChartkick, { LineChart, ColumnChart } from 'react-chartkick'
import Chart from 'chart.js'
ReactChartkick.addAdapter(Chart)

class CompetitorAnalysis extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props){
    super(props);
    this.state = {}
  }
  updateData(){
    const { firebase, roomNum, firmNum, roundNum } = this.props;
    console.log(roundNum);
    const that = this;
    firebase.getCompetitorOutputData(roomNum, firmNum, roundNum).then((data)=>{
      console.log(data)
      that.setState(data)
    })
  }
  componentWillMount(){this.updateData()}
  componentWillReceiveProps(){this.updateData()}
  render(){
    const {
      profitPerCompany,
      accumprofitPerCompany,
      roundArray
    } = this.state;
    if (roundArray) {
      this.firmPanes = Object.keys(
        roundArray
      ).map((key) => {
        return {
          menuItem: key, render: () => {
            return <Tab.Pane attached={false}>
              <LineChart
            download={true}
            thousands=","
            xtitle='Round'
            curve={false}
            data={roundArray[key]}
              />
              </Tab.Pane>
          }
        }
      })}

    return(
      <div>
        <Header as='h2' color='teal'>
          <Header.Content>Competitors Analysis</Header.Content>
          <Header.Subheader>Each Firm's Output</Header.Subheader>
        </Header>
        {
        roundArray ?
        <Tab menu={{ fluid: true, vertical: true }} menuPosition='right' panes={this.firmPanes} />
        : null
        }
        <Header as='h2' color='teal'>
          <Header.Subheader>Profit of Each Firm</Header.Subheader>
        </Header>
        <Segment>
          <ColumnChart thousands="," xtitle="Firm" curve={false} data={profitPerCompany}/>
        </Segment>
        <Header as='h2' color='teal'>
          <Header.Subheader>Accumulated profit of Each Firm</Header.Subheader>
        </Header>
        <Segment>
          <ColumnChart thousands="," xtitle="Firm" curve={false} data={accumprofitPerCompany}/>
        </Segment>
      </div>
    );
  }
}

export default withCookies(CompetitorAnalysis);
