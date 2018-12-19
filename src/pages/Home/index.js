import React, { Component } from "react";
import {
  Button,
  Form,
  Tab,
  Grid,
  Segment,
  Header,
  Icon,
  Message
} from "semantic-ui-react";
import { Redirect } from "react-router-dom";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";

class Home extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      roomNum: "",
      password: "",
      groupNum: "",
      message: "",
      un_set: true,
      redirectTo: "/"
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showErrorMessage = this.showErrorMessage.bind(this);
    this.redirectTo = this.redirectTo.bind(this);
  }
  componentWillMount() {
    const { cookies } = this.props;
    this.setState(
      {
        roomNum: cookies.get("roomNum", { path: "/" }) || "",
        groupNum: cookies.get("groupNum", { path: "/" }) || ""
      },
      () => {
        console.log(this.state);
      }
    );
  }
  showErrorMessage(message) {
    this.setState({
      message
    });
  }
  redirectTo(path) {
    this.setState({
      un_set: false,
      redirectTo: path
    });
  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  handleSubmit(event) {
    event.preventDefault();
    const { cookies, firebase } = this.props;
    const { roomNum, groupNum } = this.state;
    const that = this;
    const { name } = event.target;  // name = event.target.name
    const target = event.target;
    cookies.set("roomNum", roomNum, { path: "/" });
    cookies.set("groupNum", groupNum, { path: "/" });
    console.log(`Form ${target.name} submitted`);
    if (name === "student") {
      if (roomNum.length >= 1 && groupNum.length >= 1) {
        firebase
          .isRoomExist(this.state.roomNum, this.state.groupNum)
          .then(result => {
            if (result) that.redirectTo("/game_start");
          })
          .catch(err => {
            that.showErrorMessage(err.message);
          });
      } else {
        that.showErrorMessage("Please provide sufficient data.");
      }
    }
  }
  renderStudentPane = () => {
    return (
      <Tab.Pane>
        <Form onSubmit={this.handleSubmit} name="student">
          <Form.Field>
            <label>Room Number</label>
            <input
              value={this.state.roomNum || ""}
              onChange={this.handleInputChange}
              name="roomNum"
              placeholder="Please Enter The Room Number"
            />
          </Form.Field>
          <Form.Field>
            <label>Group Number</label>
            <input
              value={this.state.groupNum || ""}
              onChange={this.handleInputChange}
              name="groupNum"
              placeholder="Please Enter The Group Number"
            />
          </Form.Field>
          <Button type="submit" fluid color="teal">
            {" "}
            Submit
          </Button>
        </Form>
      </Tab.Pane>
    );
  };
  renderTeacherPane = () => {
    return (
      <Tab.Pane>
        <Form onSubmit={this.handleSubmit} name="teacher">
          <Form.Field>
            <label>Room Number</label>
            <input
              value={this.state.roomNum || ""}
              onChange={this.handleInputChange}
              name="roomNum"
              placeholder="Please Enter The Room Number"
            />
          </Form.Field>
          <Form.Field>
            <label>Password</label>
            <input
              value={this.state.password || ""}
              onChange={this.handleInputChange}
              name="password"
              type="password"
              placeholder="Please Enter Your Password"
            />
          </Form.Field>
          <Button type="submit" fluid color="teal">
            Submit
          </Button>
        </Form>
      </Tab.Pane>
    );
  };
  renderAboutPane = () => {
    return (
      <Tab.Pane style={{ height: "500px", overflowY: "scroll" }}>
        <p>
          <span class="c31">Games Proposal</span>
        </p>
        <p>
          <span class="c11">Pre-games</span>
        </p>
        <ol type="1">
          <li>
            <span class="c11">
              Each group will be given a role to play as a manager in firms.
            </span>
          </li>
        </ol>
        <p>
          <span class="c1">Four to five people per group</span>
        </p>
        <ol start="2" type="1">
          <li>
            <span id="h.gjdgxs">
              <span class="c11">
                Firm’s background setting and rules for activities (phone firms)
              </span>
            </span>
          </li>
        </ol>
        <ol type="1">
          <li>
            <span class="c6">
              Each firm will be given different financial background
            </span>
          </li>
          <li>
            <span class="c6">
              ACCT concept will be used to monitor the performance of company
            </span>
          </li>
        </ol>
        <ul>
          <li>
            <span class="c1">
              Every firm will receive a balance sheet, the net income (profit)/
              loss will transfer to retain earning at the end of each round.
            </span>
          </li>
        </ul>
        <p>
          C. <span class="c12">Asset and Liabilities</span>
        </p>
        <p>c.1 Cash</p>
        <ul>
          <li>Cash amount will increase by profiting</li>
        </ul>
        <p>
          <span class="c1">c.2 Borrowing</span>
        </p>
        <ul>
          <li>
            <span class="c1">Every </span>
            firm
            <span class="c1"> can borrow </span>
            money
            <span class="c1"> from the bank (teacher) once in every </span>
            month
            <span class="c1"> (no requirement for asking in the first</span>
            round
            <span class="c1">
               of the lecture) and have to pay back three rounds later
            </span>
          </li>
          <li>
            <span class="c1">Interest expense 1</span>
            .75
            <span class="c1">%</span>
          </li>
        </ul>
        <ol start="4" type="1">
          <li>
            <span class="c6">Bankruptcy rule</span>
          </li>
        </ol>
        <ul>
          <li>
            <span class="c1">
              Firms should run their business sustainable and avoid bankruptcy
            </span>
          </li>
          <li>
            <span class="c1">Measurement</span>
          </li>
        </ul>
        <p>
          <span class="c1">Measurement:</span>
        </p>
        <ul>
          <li>
            <span class="c1">ROA = net income/ Average total asset</span>
          </li>
          <li>
            <span class="c1">
              ROE = net income/ Average shareholder equity (no preference
              dividends)
            </span>
          </li>
        </ul>
        <ul>
          <li>
            <span class="c1">
              The Net loss should not exceed certain percentage of total
            </span>
            retained
            <span class="c1"> earning</span>
          </li>
          <li>
            <span class="c1">
              Current ratio (Current asset/ Current liabilities) should not
              exceed certain percentage
            </span>
          </li>
          <li>
            <span class="c1">
              Debt ratio (Total asset/ Total liabilities) should not exceed
              certain percentage
            </span>
            .<span class="c1"> </span>
          </li>
        </ul>
        <ol start="5" type="1">
          <li>
            <span class="c6">Production Rules</span>
          </li>
        </ol>
        <p>
          <span class="c12">        </span>
          <span class="c1">Good sold amount = Good produced amount</span>
        </p>
        <ol start="6" type="1">
          <li>
            <span class="c6">Suggestion of awarding and penalties</span>
          </li>
        </ol>
        <ul>
          <li>
            <span class="c1">
              Performance: Firms will be graded by their performance. If fail to
              achieve minimize level, firms will
            </span>
             be kicked out of game (but have the sight to look how other teams
            perform in further rounds.)
          </li>
          <li>
            <span class="c1">Over losing, over-borrowing: Consi</span>
            der bankrupt, will be kicked out of the game.
            <span class="c1">
               (points deduction or extra reflective essay.)
            </span>
          </li>
        </ul>
        <p>
          <span class="c11" />
        </p>
        <p>
          <span class="c11" />
        </p>
        <p>
          <span class="c11" />
        </p>
        <p>
          <span class="c11" />
        </p>
        <ol start="3" type="1">
          <li>
            <span class="c11">Game setting</span>
          </li>
        </ol>
        <p>
          <span class="c1" />
        </p>
        <ol type="1">
          <li>
            <span class="c6">
              Demand uncertainty (random number for intercept and slope)
            </span>
          </li>
          <li>
            <span class="c6">Cost</span>
          </li>
        </ol>
        <ul>
          <li>
            <span class="c1">
              The cost is divided to Fixed cost and variable cost (Cost third
              orders function)
            </span>
          </li>
        </ul>
        <p>
          <span class="c1">C.         Business Strategy:</span>
        </p>
        <p>
          <span class="c1">c.1.        Production Capacity</span>
        </p>
        <ul>
          <li>
            <span class="c1">
              The Capacity is strict by certain level, but can increase by
              purchasing PPE
            </span>
          </li>
          <li>
            <span class="c19">
              Similarly, we can allow for an option for firms to invest and
              lower MC
            </span>
          </li>
        </ul>
        <p>
          <span class="c1">c.2.       Advertisement</span>
        </p>
        <ol start="4" type="1">
          <li>
            <span class="c6">
              Display method for the information of each team
            </span>
          </li>
        </ol>
        <p>
          <span class="c1">
            (Student mentioned that the cost shouldn’t be displayed, and some
            other information can be displayed several rounds later)
          </span>
        </p>
        <p>
          <span class="c1">
            (Some complain that they can’t see the results)
          </span>
        </p>
        <ol start="5" type="1">
          <li>
            <span class="c6">
              Should the leader of the Stackelberg maintain the same? Two
              students
            </span>
          </li>
        </ol>
        <ol start="4" type="1">
          <li>
            <span class="c11">The market will vary with the round running</span>
          </li>
        </ol>
        <p>
          <span class="c1" />
        </p>
        <ol type="1">
          <li>
            <span class="c1">
              The activity includes economics models such as monopoly,
            </span>
          </li>
        </ol>
        <ul>
          <li>
            <span class="c1">Cournot</span>
          </li>
          <li>
            <span class="c1">Stackelberg</span>
          </li>
          <li>
            <span class="c1">Differentiated products</span>
          </li>
          <li>
            <span class="c1">Imposition of Tax (Cost function)</span>
          </li>
          <li>
            <span class="c1">Advertisement</span>
          </li>
        </ul>
        <p>
          <span class="c1" />
        </p>
        <ol start="2" type="1">
          <li>
            <span class="c1">
              Differentiated products with interrelated demand curve (Bertrand
              with differentiated products)
            </span>
          </li>
        </ol>
      </Tab.Pane>
    );
  };
  render() {
    const panes = [
      { menuItem: "Student", render: () => this.renderStudentPane() },
      { menuItem: "Teacher", render: () => this.renderTeacherPane() },
      { menuItem: "About", render: () => this.renderAboutPane() }
    ];
    if (this.state.un_set) {
      return (
        <Segment secondary style={{ height: "100%" }}>
          <Grid
            stackable
            verticalAlign="middle"
            centered
            columns={2}
            container
            style={{ height: "100%" }}>
            <Grid.Column>
              <Header textAlign="center" color="teal">
                <Icon name="graduation cap" />
                CUHK Business Platform
              </Header>
              <Segment>
                <Tab panes={panes} />
              </Segment>
              <Message
                hidden={this.state.message.length === 0}
                attached="bottom"
                error>
                <Icon name="dont" />
                {this.state.message}
              </Message>
            </Grid.Column>
          </Grid>
        </Segment>
      );
    } else {
      return <Redirect to={this.state.redirectTo} />;
    }
  }
}

export default withCookies(Home);
