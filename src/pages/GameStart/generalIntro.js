import React, { Component}  from 'react';
import { Header, Container } from 'semantic-ui-react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';

class GeneralIntro extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  constructor(props){
    super(props);   
  }
  render(){
    const { gameRule, desOfFirms, marketDes, goalOfFirms } = this.props
    return(
      <div>
        <Header as='h2' color='teal'>
          <Header.Content>General Introduction</Header.Content>
          <Header.Subheader>Game Rules</Header.Subheader>
        </Header>
        <Container style={{whiteSpace: 'pre-line'}}>
          { gameRule }
        </Container>
        <Header as='h2' color='teal'>
          <Header.Content>Market Introduction</Header.Content>
          <Header.Subheader>Market Situation</Header.Subheader>
        </Header>
        <Container style={{whiteSpace: 'pre-line'}}>
          { desOfFirms }
        </Container>
        <Header as='h2' color='teal'>
          <Header.Subheader>Model of Market Structure</Header.Subheader>
        </Header>
        <Container style={{whiteSpace: 'pre-line'}}>
          { marketDes }
        </Container>
        <Header as='h2' color='teal'>
          <Header.Subheader>Firm's Objective</Header.Subheader>
        </Header>
        <Container style={{whiteSpace: 'pre-line'}}>
          { goalOfFirms }
        </Container>
      </div>
    );
  }
}

export default withCookies(GeneralIntro);
