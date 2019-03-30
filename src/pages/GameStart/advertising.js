import * as React from 'react';
import { Table } from "semantic-ui-react";
import ReactChartkick, { LineChart, ColumnChart  } from "react-chartkick";
import Chart from "chart.js";
ReactChartkick.addAdapter(Chart);

class AdvertisingCahrt extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    let { firebase, roomNum, index } = this.props
    let { database } = firebase

    database.ref(`${roomNum}/on/round/`).on('value', (snap) => {
      let data = snap.val()
      let result = []

      if(data) {
        let rounds = Object.keys(data).filter((key) => /round\d/.test(key)).map((key) => data[key])

        rounds.forEach((round, roundIndex) => {
          result.push([roundIndex+1, round[index] ? round[index].advertising : 0])
        })
      }

      this.setState({ data: result })
    })
  }

  render() {
    let { name } = this.props
    let { data } = this.state

    console.log(data);

    return (
      <ColumnChart data={data} title={name} ytitle="Amount" xtitle="Round" />
    )
  }
}


export default class Advertising extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      companyNames: [],
    }
  }

  componentDidMount() {
    let { firebase, roomNum, roundNum } = this.props
    let { database } = firebase

    database.ref(`${roomNum}/on`).once('value', (snap) => {
      let data = snap.val()
      let { roomInfo } = data
      let { firmNum } = roomInfo
      let result = []

      for(let i = 1; i <= firmNum; i++) {
        let { companyName } = data[`company_${i}`]
        result.push(companyName)
      }

      this.setState({ companyNames: result })
    })
  }

  render() {
    let { companyNames } = this.state

    return (
      <div>
        {
          companyNames.map((name, index) => {
            return <AdvertisingCahrt key={name} name={name} index={index+1} {...this.props} />
          })
        }
      </div>
    )
  }
}
