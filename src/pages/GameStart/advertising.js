import * as React from 'react';
import { Table } from "semantic-ui-react";

export default class Advertising extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      costs: []
    }
  }

  componentDidMount() {
    let { firebase, roomNum, roundNum } = this.props
    let { database } = firebase

    database.ref(`${roomNum}/on`).once('value', (snap) => {
      let data = snap.val()
      let { roomInfo, round } = data
      let { firmNum } = roomInfo
      let result = []

      for(let i = 1; i <= firmNum; i++) {
        let { companyName } = data[`company_${i}`]
        result.push({
          companyName: companyName,
          advertising: round[`round${roundNum+1}`][i] ? round[`round${roundNum+1}`][i].advertising || 0 : 0
        })
      }

      this.setState({
        costs: result
      })
    })
  }

  render() {
    let { costs } = this.state

    return (
      <div>
      <table className="ui teal striped table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Company Name</Table.HeaderCell>
            <Table.HeaderCell>Cost</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            costs.map((cost, key) => (
              <Table.Row key={cost.companyName+key}>
                <Table.Cell width={10}>{cost.companyName}</Table.Cell>
                <Table.Cell width={6}>{cost.advertising}</Table.Cell>
              </Table.Row>
            ))
          }
        </Table.Body>
      </table>
      </div>
    )
  }
}
