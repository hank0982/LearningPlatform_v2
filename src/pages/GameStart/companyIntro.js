import React, { Component } from "react";
import { Header, Container, Dimmer, Loader } from "semantic-ui-react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import BalanceSheet from "../../components/BalanceSheet";

class CompanyIntro extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props) {
    super(props);
  }

  render() {
    const { companyInfo } = this.props;
    if (!companyInfo) {
      return (
        <Dimmer active>
          <Loader>Loading</Loader>
        </Dimmer>
      );
    } else {
      return (
        <div>
          <Header as="h2" color="teal">
            Company Intro
          </Header>
          <Container style={{ whiteSpace: "pre-line" }}>
            {companyInfo.companyDescription}
          </Container>
          <Header as="h2" color="teal">
            Balance Sheet
          </Header>
          <BalanceSheet companyInfo={companyInfo} />
        </div>
      );
    }
  }
}

export default withCookies(CompanyIntro);
