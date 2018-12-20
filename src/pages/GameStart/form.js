import React, { Component } from "react";
import { Header, Segment, Divider, Form, Button } from "semantic-ui-react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class GameForm extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      companyInfo: null,
      roundInfo: null,
      borrowing: "",
      returning: "",
      decision: ""
    };
    this.handleBorrow = this.handleBorrow.bind(this);
    this.handleReturn = this.handleReturn.bind(this);
    this.handleDecision = this.handleDecision.bind(this);
    this.submitDecision = this.submitDecision.bind(this);
  }
  componentWillMount() {
    const { firebase, roomNum, groupNum, roomInfo } = this.props;
    const that = this;
    firebase.getCompanyListener(roomNum, groupNum, companyInfo => {
      that.setState({
        companyInfo
      });
    });
    firebase.getCompanyRoundStatusListener(roomNum, groupNum, data => {
      console.log("change", data);
      that.setState({
        roundInfo: data
      });
    });
  }

  // Production Cost formula
  renderTotalCost() {
    let { companyInfo } = this.state;
    console.log(companyInfo);
    if (companyInfo) {
      return (
        <Segment>
          <p style={{ whiteSpace: "pre-line" }}>
            {companyInfo.constant === 0 ? null : companyInfo.constant}
            {companyInfo.constant === 0 || companyInfo.coefficientOne === 0
              ? null
              : " + "}
            {companyInfo.coefficientOne === 0
              ? null
              : companyInfo.coefficientOne === 1
              ? "q"
              : companyInfo.coefficientOne + "q"}
            {companyInfo.coefficientOne === 0 ||
            companyInfo.coefficientTwo === 0
              ? null
              : " + "}
            {companyInfo.coefficientTwo === 0
              ? null
              : companyInfo.coefficientTwo === 1
              ? "q"
              : companyInfo.coefficientTwo + "q"}
            {companyInfo.coefficientTwo === 0 ? null : <sup>2</sup>}
            {companyInfo.coefficientTwo === 0 ||
            companyInfo.coefficientThree === 0
              ? null
              : " + "}
            {companyInfo.coefficientThree === 0
              ? null
              : companyInfo.coefficientThree === 1
              ? "q"
              : companyInfo.coefficientThree + "q"}
            {companyInfo.coefficientThree === 0 ? null : <sup>3</sup>}
          </p>{" "}
        </Segment>
      );
    } else {
      return null;
    }
  }

  // When player inputs "Borrow",
  // set `this.state.borrowing` to what s/he types
  handleBorrow(e) {
    this.setState({
      borrowing: e.target.value
    });
  }

  handleReturn(e) {
    this.setState({
      returning: e.target.value
    });
  }

  handleDecision(e) {
    this.setState({
      decision: e.target.value
    });
  }

  submitDecision() {
    // DOING

    // Set all input boxes back to empty strings
    this.setState({
      borrowing: "",
      returning: "",
      decision: ""
    });
  }

  render() {
    const { companyInfo, roundInfo } = this.state;
    console.log(roundInfo);
    return (
      <div>
        <Header as="h2" color="teal">
          <Header.Content>Production Cost</Header.Content>
        </Header>
        {this.renderTotalCost()}
        <Header as="h2" color="teal">
          <Header.Content>Production Capacity</Header.Content>
        </Header>
        <Segment>
          Maximum {companyInfo && companyInfo.maximum}
          <Divider />
          Minimum {companyInfo && companyInfo.minimum}
        </Segment>
        <Header as="h2" color="teal">
          <Header.Content>Additional Functions</Header.Content>
          <Form>
            {/* Alter `companyInfo.liabilitiesBorrwoing` */}
            <Form.Field>
              <label>Borrow</label>
              <input
                placeholder="Borrowing Amount (in USD)"
                value={this.state.borrowing}
                onChange={this.handleBorrow}
              />
            </Form.Field>
            <Form.Field>
              <label>Return</label>
              <input
                placeholder="Returning Amount (in USD)"
                value={this.state.returning}
                onChange={this.handleReturn}
              />
            </Form.Field>
          </Form>
        </Header>
        <Header as="h2" color="teal">
          <Header.Content>Your Decision</Header.Content>
        </Header>
        {(roundInfo && roundInfo.submit === false) || !roundInfo ? (
          <Form>
            <Form.Field>
              <label>Quantity of Your Production</label>
              <input
                placeholder="Quantity"
                value={this.state.decision}
                onChange={this.handleDecision}
              />
            </Form.Field>
            <Button
              size="tiny"
              type="submit"
              color="teal"
              onClick={this.submitDecision}>
              <i class="sign in icon" />
              Submit!
            </Button>
          </Form>
        ) : (
          <Segment>Please Wait for other groups</Segment>
        )}
      </div>
    );
  }
}

export default withCookies(GameForm);
