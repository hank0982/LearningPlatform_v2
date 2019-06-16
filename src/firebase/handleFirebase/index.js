// FirebaseHandler

import firebase from "firebase/app";
import "firebase/database";
import config from "./key";
import { isNull } from "util";

class FirebaseHandler {
  constructor() {
    this.database = firebase.initializeApp(config, "database").database();
    this.getFirmNames = this.getFirmNames.bind(this);
  }

  getRoomRootRef(roomNum) {
    return this.database.ref(roomNum).child("on");
  }

  isRoomExist(roomNum, groupNum) {
    return this.getRoomRootRef(roomNum)
      .child("company_" + groupNum)
      .once("value")
      .then(data => {
        if (isNull(data.val())) {
          return Promise.reject(
            new Error(
              "Sorry, the room or group number you provide is not valid. Please try again."
            )
          );
        } else {
          return Promise.resolve("success");
        }
      })
      .catch(e => {
        return Promise.reject(e);
      });
  }

  getRoomInfo(roomNum, cb) {
    return this.getRoomRootRef(roomNum)
      .child("roomInfo")
      .on("value", snap => {
        if (!isNull(snap.val())) {
          cb(snap.val());
        } else {
          cb(new Error("Room Info is empty"));
        }
      });
  }

  getCurrentRound(roomNum, cb) {
    return this.getRoomRootRef(roomNum)
      .child("round")
      .child("currentRound")
      .on("value", snap => {
        if (!isNull(snap.val())) {
          cb(snap.val());
        } else {
          cb(new Error("Round number is empty"));
        }
      });
  }

  getCompanyListener(roomNum, groupNum, cb) {
    return this.getRoomRootRef(roomNum)
      .child(`company_${groupNum}`)
      .on("value", snap => {
        cb(snap.val());
      });
  }

  pushCompanyDecision(
    roomNum,
    groupNum,
    roundNum,
    returning,
    borrowing,
    quantity,
  ) {
    return this.getRoomRootRef(roomNum)
      .child("round")
      .child(`round${roundNum}`)
      .child(`${groupNum}`)
      .update({
        isBorrowing: borrowing > 0,
        numBorrowing: borrowing,
        quantityProduction: quantity,
        returning,
        submit: true
      });
  }

  async leaderSubmitted(roomNum, roundNum, cb) {
    if (
      (await this.getData(
        this.database
          .ref(roomNum)
          .child("on")
          .child("roomInfo")
          .child("marketType")
      )) === "stackelberg"
    ) {
      var leaderNum = this.database
        .ref(roomNum)
        .child("on")
        .child("roomInfo")
        .child("leader");
      var leaderNum_v = parseInt(await this.getData(leaderNum), 10);
      var leaderQ = this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .child(leaderNum_v)
        .child("quantityProduction");

      leaderQ.on("value", snap => {
        cb(snap.val());
      });
    } else {
      return true;
    }
  }
  async isStackelberg(roomNum) {
    return (
      (await this.getData(
        this.database
          .ref(roomNum)
          .child("on")
          .child("roomInfo")
          .child("marketType")
      )) == "stackelberg"
    );
  }
  async isLeader(roomNum, groupNum) {
    if (
      (await this.getData(
        this.database
          .ref(roomNum)
          .child("on")
          .child("roomInfo")
          .child("marketType")
      )) !== "stackelberg"
    ) {
      return true;
    }
    var leaderNum = this.database
      .ref(roomNum)
      .child("on")
      .child("roomInfo")
      .child("leader");
    var leaderNum_v = parseInt(await this.getData(leaderNum), 10);
    return leaderNum_v == groupNum;
  }

  async displayLeaderQ(roomNum, roundNum, cb) {
    var leaderNum = this.database
      .ref(roomNum)
      .child("on")
      .child("roomInfo")
      .child("leader");
    var leaderNum_v = parseInt(await this.getData(leaderNum), 10);
    var leaderQ = this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .child(`round${roundNum}`)
      .child(leaderNum_v)
      .child("quantityProduction");
    return leaderQ.on("value", snap => {
      cb(snap.val());
    });
  }

  compareFirmNum(roomNum, roundNum) {
    return this.getRoomRootRef(roomNum)
      .child("roomInfo")
      .child("firmNum")
      .once("value")
      .then(firmNum => {
        let submitted = []
        let firmNum_v = firmNum.val()
        for(let i = 0; i < firmNum_v; i++) {
          submitted.push(false)
        }

        return this.getRoomRootRef(roomNum)
          .child("round")
          .child(`round${roundNum}`)
          .once("value")
          .then(snap => {
            let data = snap.val()
            for(let i = 1; i <= firmNum_v; i++) {
              let roundCompany = data[i]
              if(roundCompany && roundCompany.submit === true) submitted[i-1] = true
            }

            return submitted.reduce((p, n) => p &&n)
          });
      });
  }

  getData(ref,defaultValue=null) {
    // Pass in a reference path and return a Promise
    return ref.once("value").then(snap => {
      if (!isNull(snap.val())) {
        return Promise.resolve(snap.val());
      } else {
        if(isNull(defaultValue)){
          return Promise.reject(new Error(ref + " is empty"));
        }else{
          return Promise.resolve(defaultValue);
        }
      }
    });
  }

  async calculateUnitPrice(roomNum, roundNum) {
    var that = this;
    let { database } = this
    var roomInfo = this.getRoomRootRef(roomNum).child("roomInfo");
    var totalQuantityInThisRound = 0;
    var constant_v = parseFloat(await this.getData(roomInfo.child("constant")));
    var slope_v = parseFloat(await this.getData(roomInfo.child("slope")));
    var firmNum_v = parseInt(await this.getData(roomInfo.child("firmNum")), 10);
    var unitPrice = 0;
    var companyQuantity_array = []
    var gameInfo = await new Promise((resolve) => {
      database.ref(`${roomNum}/on`).once('value', (snap) => {
        resolve(snap.val())
      })
    })
    let currentRoundInfo = gameInfo.round[`round${roundNum}`]
    let { productionDifferentiation, advertisementImplement } = gameInfo.roomInfo

    if(productionDifferentiation === true) {
      for(let i = 1; i <= firmNum_v; i++) {
        let companyStr = `company_${i}`
        let ref = `${roomNum}/on/round/round${roundNum}/${i}`
        let company = gameInfo[companyStr]
        let { dconstant } = company
        let unitPrice = parseFloat(dconstant)

        for(let j = 1; j <= firmNum_v; j++) {
          let slope = parseFloat(company[`slope${j}`])
          let adver = parseFloat(company[`adver${j}`]) || 0
          let { advertising, quantityProduction } = currentRoundInfo[j]

          unitPrice += slope * quantityProduction
          if(advertisementImplement === true) unitPrice -= (i !== j) ? parseFloat(adver) : -parseFloat(adver) * advertising
        }

        database.ref(ref).update({
          price: unitPrice
        })
      }
    }
    else {
      for (var i = 0; i < firmNum_v; i++) {
        var companyQuantity_v = parseInt(
          await this.getData(
            this.database
            .ref(roomNum)
            .child("on")
            .child("round")
            .child(`round${roundNum}`)
            .child(i + 1)
            .child("quantityProduction")
          ),
          10
        );
        companyQuantity_array.push(companyQuantity_v)
        totalQuantityInThisRound += companyQuantity_v;
      }
      unitPrice = constant_v + slope_v * totalQuantityInThisRound;
      if (unitPrice < 0) {
        unitPrice = 0;
      }

      if ((await this.getData(roomInfo.child("marketType"))) !== "monoply") {
        that
          .getRoomRootRef(roomNum)
          .child("round")
          .child(`round${roundNum}`)
          .update({
            price: unitPrice
          });
      } else {
        for (i = 1; i <= firmNum_v; i++) {
          await that
            .getRoomRootRef(roomNum)
            .child("round")
            .child(`round${roundNum}`)
            .child(i)
            .update({
              price: constant_v + slope_v * companyQuantity_array[i-1]
            });
        }
      }
    }
  }

  async calculateUnitCost(roomNum, roundNum) {
    var that = this;
    let { database } = this
    var roomInfo = that.getRoomRootRef(roomNum).child("roomInfo");
    var firmNum_v = parseInt(await this.getData(roomInfo.child("firmNum")), 10);
    var companyNum = this.database.ref(roomNum).child("on");
    var gameInfo = await new Promise((resolve) => {
      database.ref(`${roomNum}/on`).once('value', (snap) => {
        resolve(snap.val())
      })
    })
    let { productionDifferentiation, advertisementImplement, increaseInCapacity, investmentCostA, investmentCostB } = gameInfo.roomInfo

    if(increaseInCapacity) {
      for (var i = 1; i <= firmNum_v; i++) {
        let { cf1_const, cf1_slope1, cf1_slope2, cf1_slope3, cf2_const, cf2_slope1, cf2_slope2, cf2_slope3, cf3_const, cf3_slope1, cf3_slope2, cf3_slope3, totalInvestment } = gameInfo[`company_${i}`]
        let { quantityProduction, investment } = gameInfo.round[`round${roundNum}`][i]
        let cost = 0
        totalInvestment = totalInvestment || 0
        if(totalInvestment > parseInt(investmentCostB, 10)) {
          cost = parseInt(cf3_const, 10)+parseInt(quantityProduction, 10) * parseFloat(cf3_slope1) + Math.pow(parseInt(quantityProduction, 10), 2) * parseFloat(cf3_slope2) + Math.pow(parseInt(quantityProduction, 10), 3) * parseFloat(cf3_slope3)
          totalInvestment = 0
        }
        else if(totalInvestment > parseInt(investmentCostA, 10)) {
          cost = parseInt(cf2_const, 10)+parseInt(quantityProduction, 10) * parseFloat(cf2_slope1) + Math.pow(parseInt(quantityProduction, 10), 2) * parseFloat(cf2_slope2) + Math.pow(parseInt(quantityProduction, 10), 3) * parseFloat(cf2_slope3)
          totalInvestment = 0
        }
        else {
          cost = parseInt(cf1_const, 10)+parseInt(quantityProduction, 10) * parseFloat(cf1_slope1) + Math.pow(parseInt(quantityProduction, 10), 2) * parseFloat(cf1_slope2) + Math.pow(parseInt(quantityProduction, 10), 3) * parseFloat(cf1_slope3)
        }

        totalInvestment +=  parseInt(investment, 10)

        database.ref(`${roomNum}/on/round/round${roundNum}/${i}`).update({unitCost: cost})
        database.ref(`${roomNum}/on/company_${i}`).update({totalInvestment: totalInvestment})
      }
    }
    else {
      for (var i = 1; i <= firmNum_v; i++) {
        var c1 = companyNum.child(`company_${i}`).child("coefficientOne");
        var c2 = companyNum.child(`company_${i}`).child("coefficientTwo");
        var c3 = companyNum.child(`company_${i}`).child("coefficientThree");
        var constant = companyNum.child(`company_${i}`).child("constant"); // not the previous constant!
        var companyQuantity = that
          .getRoomRootRef(roomNum)
          .child("round")
          .child(`round${roundNum}`)
          .child(i)
          .child("quantityProduction");
        var advertising = that
          .getRoomRootRef(roomNum)
          .child("round")
          .child(`round${roundNum}`)
          .child(i)
          .child("advertising");
        var c1_v = parseFloat(await this.getData(c1));
        var c2_v = parseFloat(await this.getData(c2));
        var c3_v = parseFloat(await this.getData(c3));
        var constant_v = parseFloat(await this.getData(constant));
        var companyQuantity_v = parseFloat(await this.getData(companyQuantity));
        var advertising_v = parseFloat(await this.getData(advertising, 0));
        console.log(companyQuantity_v)
        var totalCost =
          c1_v * companyQuantity_v +
          c2_v * companyQuantity_v * companyQuantity_v +
          c3_v * companyQuantity_v * companyQuantity_v * companyQuantity_v +
          constant_v;
        if(advertisementImplement === true && productionDifferentiation === true) totalCost += advertising_v
        if(companyQuantity_v==0.0){
          that
            .getRoomRootRef(roomNum)
            .child("round")
            .child(`round${roundNum}`)
            .child(i)
            .update({
              unitCost:0
            });
        }else{
          that
            .getRoomRootRef(roomNum)
            .child("round")
            .child(`round${roundNum}`)
            .child(i)
            .update({
              unitCost: totalCost / companyQuantity_v
            });
        }
      }
    }
  }

  async calculateProfit(roomNum, roundNum) {
    var roomInfo = this.getRoomRootRef(roomNum).child("roomInfo");
    var whichFirm = this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .child(`round${roundNum}`);
    var firmNum_v = parseInt(await this.getData(roomInfo.child("firmNum")), 10);
    var unitPrice;
    for (var i = 1; i <= firmNum_v; i++) {
      if ((await this.getData(roomInfo.child("marketType"))) !== "monoply" && (await this.getData(roomInfo.child('productionDifferentiation'))) === false) {
        unitPrice = whichFirm.child("price");
      } else {
        unitPrice = whichFirm.child(i).child("price");
      }
      var unitCost = whichFirm.child(i).child("unitCost");
      var companyQuantity = whichFirm.child(i).child("quantityProduction");
      var unitPrice_v = parseFloat(await this.getData(unitPrice));
      var unitCost_v = parseFloat(await this.getData(unitCost));
      var companyQuantity_v = parseFloat(await this.getData(companyQuantity));
      await this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .child(i)
        .update({
          profit: (unitPrice_v - unitCost_v) * companyQuantity_v
        });
    }
  }

  async calculateRevenue(roomNum, roundNum) {
    var roomInfo = this.database // Simplifying a path for future use
      .ref(roomNum)
      .child("on")
      .child("roomInfo");
    var whichFirm = this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .child(`round${roundNum}`);
    var firmNum_v = parseInt(await this.getData(roomInfo.child("firmNum")), 10);
    var unitPrice;
    var i = 1;
    for (; i <= firmNum_v; i++) {
      if ((await this.getData(roomInfo.child("marketType"))) !== "monoply" && (await this.getData(roomInfo.child('productionDifferentiation'))) === false) {
        unitPrice = whichFirm.child("price");
      } else {
        unitPrice = whichFirm.child(i).child("price");
      }
      var companyQuantity = this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .child(i)
        .child("quantityProduction");
      var unitPrice_v = parseFloat(await this.getData(unitPrice));
      var companyQuantity_v = parseFloat(await this.getData(companyQuantity));
      await this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .child(i)
        .update({
          revenue: unitPrice_v * companyQuantity_v
        });
      if (i == firmNum_v) {
        return Promise.resolve(true);
      }
    }
  }

  async calculateFutureReturn(roomNum, groupNum, roundNum) {
    const roundInfo = this.database // Simplifying a path for future use
      .ref(roomNum)
      .child("on")
      .child("round");
    let currentRoundData = await this.getData(
      roundInfo.child(`round${roundNum}`).child(groupNum)
    );

    if (!currentRoundData.isBorrowing) return 0;

    let numBorrowing = currentRoundData.numBorrowing;
    let marketInterestRate = parseInt(
      await this.getData(
        this.database
          .ref(roomNum)
          .child("on")
          .child(`company_${groupNum}`)
          .child("marketInterestRate")
      ),
      10
    );
    for (let i = 1; i < 4; i++) {
      // three rounds
      let returning = parseInt(
        await this.getData(
          roundInfo
            .child(`round${roundNum + i}`)
            .child(groupNum)
            .child("returning"),0
        ),
        10
      );
      numBorrowing *= marketInterestRate;
      returning += numBorrowing;
      await roundInfo
        .child(`round${roundNum + i}`)
        .set({});
      await roundInfo
        .child(`round${roundNum + i}`)
        .child(groupNum)
        .set({});
      await roundInfo
        .child(`round${roundNum + i}`)
        .child(groupNum)
        .set({ returning });
    }
  }

  async falsifyEndroundbutton(roomNum) {
    await this.getRoomRootRef(roomNum)
      .child("round")
      .update({
        endroundbutton: false
      });
  }

  getCompanyName(roomNum, groupNum, defaultValue=null) {
    return this.getRoomRootRef(roomNum)
      .child("company_" + groupNum)
      .child("companyName")
      .once("value")
      .then(snap => {
        if (!isNull(snap.val())) {
          return Promise.resolve(snap.val());
        } else {
          if(!isNull(defaultValue)){
            return Promise.reject(new Error("Round Number is empty"));
          }else{
            return Promise.resolve(defaultValue);
          }
        }
      })
      .catch(err => {
        return Promise.reject(new Error(err));
      });
  }

  getBusinessOperationData(roomNum, groupNum, roundNum, marketType) {
    const currentRound = roundNum;
    const unitCostPerRounds = {};
    const revenuePerRounds = {};
    const profitPerRounds = {};
    const pricePerRounds = {};
    var roomInfo = this.getRoomRootRef(roomNum).child("roomInfo");
    const that = this;
    return this.getRoomRootRef(roomNum)
      .child("round")
      .once("value")
      .then(async function(data) {
        const informationOfEachRound = data.val();
        console.log(informationOfEachRound)
        for (var i = 1; i <= currentRound; i++) {
          console.log(informationOfEachRound["round" + i]);
          unitCostPerRounds[i] =
            informationOfEachRound["round" + i][groupNum].unitCost;
          revenuePerRounds[i] =
            informationOfEachRound["round" + i][groupNum].revenue;
          profitPerRounds[i] =
            informationOfEachRound["round" + i][groupNum].profit;
          const isProductDiffer = await that.getData(roomInfo.child('productionDifferentiation'));
          console.log(isProductDiffer);
          if (marketType === "monoply" && (isProductDiffer === false)) {
            pricePerRounds[i] = informationOfEachRound["round" + i][groupNum].price;
          } else {
            pricePerRounds[i - 1] = informationOfEachRound["round" + i].price;
          }
        }
        return {
          unitCostPerRounds,
          revenuePerRounds,
          profitPerRounds,
          pricePerRounds
        };
      });
  }

  getCompetitorOutputData(roomNum, totalFirmNumber, currentRound) {
    return this.getFirmNames(roomNum, totalFirmNumber).then(nameList => {
      const initAccumProfitPerCompany = totalFirmNumber => {
        const accumprofitPerCompany = {};
        for (var u = 1; u <= parseInt(totalFirmNumber, 10); u++) {
          accumprofitPerCompany[nameList[u]] = 0;
        }
        return accumprofitPerCompany;
      };
      const initRoundArray = totalFirmNumber => {
        const rounds = {};
        for (var k = 1; k <= parseInt(totalFirmNumber, 10); k++) {
          rounds[nameList[k]] = {};
        }
        return rounds;
      };
      const profitPerCompany = {};
      const accumprofitPerCompany = initAccumProfitPerCompany(totalFirmNumber);
      const roundArray = initRoundArray(totalFirmNumber);
      return this.getRoomRootRef(roomNum)
        .child("round")
        .once("value")
        .then(async function(data) {
          const informationOfEachRound = await data.val();
          console.log(informationOfEachRound);
          for (var i = 1; i <= currentRound; i++) {
            for (var t = 1; t <= parseInt(totalFirmNumber, 10); t++) {
              if(informationOfEachRound["round" + i] != undefined && informationOfEachRound["round" + i][t] != undefined){
                  roundArray[nameList[t]][i] = parseInt(
                    informationOfEachRound["round" + i][t].quantityProduction,
                    10
                  );
                  if (i === currentRound) {
                    profitPerCompany[nameList[t]] = parseFloat(
                      informationOfEachRound["round" + i][t].profit
                    );
                  }
                  accumprofitPerCompany[nameList[t]] =
                    accumprofitPerCompany[nameList[t]] +
                    parseFloat(informationOfEachRound["round" + i][t].profit);
                }
              }
          }
          return {
            profitPerCompany,
            accumprofitPerCompany,
            roundArray
          };
        });
    });
  }

  getFirmNames(roomNum, totalFirmNumber) {
    var that = this;
    const nameList = {};
    return (function loop(i) {
      if (i <= totalFirmNumber) {
        return new Promise((resolve) => {
          that
            .getRoomRootRef(roomNum)
            .child(`company_${i}`)
            .child("companyName")
            .once("value")
            .then(snap => {
              nameList[i] = snap.val() + `[${i}]`;
              console.log(nameList);
              resolve(snap.val());
            });
        }).then(loop.bind(null, i + 1));
      } else {
        return Promise.resolve(nameList);
      }
    })(1);
  }

  isEndSession(roomNum, cb) {
    return this.getRoomRootRef(roomNum)
      .child("round")
      .child("endSession")
      .on("value", snap => {
        cb(snap.val());
      });
  }

  getCompanyRoundStatusListener(roomNum, groupNum, cb) {
    this.getRoomRootRef(roomNum)
      .child("round")
      .on("value", data => {
        const roundInfo = data.val();
        console.log(roundInfo);
        if (
          roundInfo["round" + roundInfo.currentRound] &&
          roundInfo["round" + roundInfo.currentRound][groupNum]
        ) {
          cb(roundInfo["round" + roundInfo.currentRound][groupNum]);
        } else {
          cb(null);
        }
      });
  }

  addMessageToDatabase(message) {
    this.database
      .ref(this.roomNum)
      .child("on")
      .child("console")
      .push()
      .set(message);
  }

  endRound(roomNum, roundNum) {
    this.calculateRoundValue().then(function() {
      this.database.ref(roomNum + "/on/round/endroundbutton").set(true);
      this.addMessageToDatabase({
        message: "End Round" + roundNum,
        time: new Date().toLocaleString("en-GB", { timeZone: "Asia/Hong_Kong" })
      });
      this.database.ref(roomNum + "/on/round/endSession").set(true);
    });
  }
}
export default FirebaseHandler;
