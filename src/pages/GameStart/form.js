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
      companyRoundInfo: null,
      borrowing: "",
      returning: "",
      decision: "",
      isLeaderSubmitted: "undefined",
      isLeader: "undefined",
      phQuantity: "Quantity"
    };
    this.handleInputFields = this.handleInputFields.bind(this);
    this.submitDecision = this.submitDecision.bind(this);
    this.dirty = false;
    console.log(this.dirty)
    window.addEventListener("beforeunload", function (event) {
        console.log(
          "ssssssssssssssssssss"
        );
        
        event.returnValue= this.dirty ? "If you leave this page you will lose your unsaved changes." : null;
    })

    window.onbeforeunload = function() {
      
    }
  }

  componentWillMount() {
    const { firebase, roomNum, groupNum, currentRound } = this.props;
    const that = this;
    firebase.getCompanyListener(roomNum, groupNum, companyInfo => {
      that.setState({
        companyInfo // companyInfo: companyInfo
      });
    });
    firebase.getCompanyRoundStatusListener(roomNum, groupNum, data => {
      that.setState({
        companyRoundInfo: data
      });
    });
    firebase.isStackelberg(roomNum).then(isSta => {
      console.log(isSta);
      if (isSta){
        firebase.leaderSubmitted(roomNum, currentRound, data => {
          console.log("Data is: " + data);
          if (data === null) {
            that.setState({
              isLeaderSubmitted: false
            });
          } else {
            that.setState({
              isLeaderSubmitted: true
            });
          }
        });
        firebase.isLeader(roomNum, groupNum).then(bool => {
          console.log(bool)
          that.setState({
            isLeader: bool
          });
        });
        firebase.displayLeaderQ(roomNum, currentRound, q => {
          if (q !== null) {
            that.setState({
              phQuantity: `The leader company submitted: ${q}`
            });
          }
        });
      }
      }
    )
    
  }

  // Production Cost formula
  renderTotalCost() {
    let { companyInfo } = this.state;
    // console.log(companyInfo);
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
  handleInputFields(e) {
    this.setState({ [e.target.name]: e.target.value });
    console.log(e.target.name + " changed to " + e.target.value);
  }

  submitDecision(e) {
    e.preventDefault();
    var that = this;
    let {
      borrowing,
      returning,
      decision,
      companyInfo,
      companyRoundInfo
    } = this.state;
    borrowing = parseInt(borrowing, 10);
    returning = parseInt(returning, 10);
    decision = parseInt(decision, 10);
    const { firebase, roomNum, groupNum, currentRound } = this.props;

    // CHECK IF RETURN/BORROWING SATISFIES REQUIREMENTS
    // RETURN = this round's returning value = set by previous rounds
    const mustReturn = companyRoundInfo ? companyRoundInfo.returning : 0;
    // RETURN < CASH or bankrupt
    if(decision < companyInfo.minimum || decision > companyInfo.maximum){
      alert("Please Check Production Capacity");
      return 0;
    }
    if (mustReturn > companyInfo.assetCash) {
      alert("bankrupt!");
      return 0;
    } else if (mustReturn === returning)
      firebase
        .pushCompanyDecision(
          roomNum,
          groupNum,
          currentRound,
          returning,
          borrowing,
          decision
        )
        .then(() => {
          this.setState({
            borrowing: "",
            returning: "",
            decision: ""
          });
          firebase.compareFirmNum(roomNum, currentRound).then(bool => {
            that.dirty = true;
            console.log(that.dirty)
            console.log(bool);
            if (bool) {
              firebase
                .calculateUnitPrice(roomNum, currentRound)
                .then(() =>
                  firebase
                    .calculateUnitCost(roomNum, currentRound)
                    .then(() =>
                      firebase
                        .calculateProfit(roomNum, currentRound)
                        .then(() =>
                          firebase.calculateRevenue(roomNum, currentRound).then(() =>{
                            firebase
                            .falsifyEndroundbutton(roomNum)
                            .then(() => {
                                that.dirty = false;
                                // firebase.calculateFutureReturn(
                                //   roomNum,
                                //   groupNum,
                                //   currentRound
                                // )
                              }
                            )
                          })
                        )
                      )
                    )
                    
                  }
          });
        });
    else alert("borrow or return does not satisfy!");
  }

  render() {
    const {
      companyInfo,
      companyRoundInfo,
      isLeaderSubmitted,
      isLeader
    } = this.state;
    // console.log(companyRoundInfo);
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
              <label>Issue Corporate Bond</label>
              <input
                placeholder="Issuing Amount (in USD)"
                name="borrowing"
                value={this.state.borrowing}
                onChange={this.handleInputFields}
              />
            </Form.Field>
            <Form.Field>
              <label>Bond Payment</label>
              <input
                placeholder="Bound Amount (in USD)"
                name="returning"
                value={this.state.returning}
                onChange={this.handleInputFields}
              />
            </Form.Field>
          </Form>
        </Header>
        <Header as="h2" color="teal">
          <Header.Content>Your Decision</Header.Content>
        </Header>
        {(companyRoundInfo && companyRoundInfo.submit === false) ||
        !companyRoundInfo ? (
          isLeaderSubmitted === false && isLeader === false ? (
            <Segment>Please wait for the leader company</Segment>
          ) : (
            <Form>
              <Form.Field>
                <label>Quantity of Your Production</label>
                <input
                  type="number"
                  placeholder={this.state.phQuantity}
                  name="decision"
                  value={this.state.decision}
                  max={parseFloat(this.state.companyInfo.maximum)}
                  min={parseFloat(this.state.companyInfo.minimum)}
                  onChange={this.handleInputFields}
                />
              </Form.Field>
              <Button
                size="tiny"
                type="submit"
                color="teal"
                onClick={this.submitDecision}
              >
                <i class="sign in icon" />
                Submit!
              </Button>
            </Form>
          )
        ) : (
          <Segment>Please wait for other groups to submit</Segment>
        )}
      </div>
    );
  }
}

export default withCookies(GameForm);
