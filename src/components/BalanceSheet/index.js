import React, { Component}  from 'react';
import { Table } from 'semantic-ui-react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import numeral from 'numeral';

class BalanceSheet extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };
  
  constructor(props){
    super(props);   
  }
  
  generateTable(title, contentArray){
    const generateRow = (title, content) => {
      return <Table.Row key={title}>
        <Table.Cell width={10}>
        {title}
      </Table.Cell>
        <Table.Cell width={6}>
        {content ? numeral(content).format('0,00') : null}
      </Table.Cell>
        </Table.Row>;
    };

    return (<Table celled striped>
            <Table.Header>
            <Table.Row>
            <Table.HeaderCell colSpan='2'>{title}</Table.HeaderCell>
            </Table.Row>
            </Table.Header>
            <Table.Body>
            {
              contentArray.map((value)=>{
                return generateRow(value[0],value[1]);
              })
            }
            </Table.Body>
            </Table>);
  }
  render(){
    const { companyInfo } = this.props;
    const totalAsset = 
          Number(companyInfo.assetCash) + Number(companyInfo.assetPPE) + Number(companyInfo.assetLand);
    const totalRetainedEarnings = 
          Number(companyInfo.beg) + Number(companyInfo.netIncome);
    const totalEquity = 
          totalRetainedEarnings + Number(companyInfo.shareCapital);
    return(
      <div>
        {this.generateTable('Asset',[
          ['Cash', companyInfo.assetCash],
          ['Plant, Property and Equipment', companyInfo.assetPPE],
          ['Land', companyInfo.assetLand],
          ['Total Asset', totalAsset]
        ])}
        {this.generateTable('Liability',[
          ['Borrowing', companyInfo.liabilitiesBorrwoing],
          ['Total Liabilities	', companyInfo.liabilitiesBorrwoing]
        ])}
        {this.generateTable('Equity',[
          ['Share Capital', companyInfo.shareCapital],
          ['Retained Earnings', null],
          ['Beg.',companyInfo.beg],
          ['Net income', companyInfo.netIncome],
          ['Total Retained Earnings', totalRetainedEarnings],
          ['Total Equity', totalEquity]
        ])}
      </div>
      
    );
    
  }
}

export default withCookies(BalanceSheet);
