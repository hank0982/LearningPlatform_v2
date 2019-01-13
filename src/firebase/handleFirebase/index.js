// FirebaseHandler

import firebase from "firebase/app";
import "firebase/database";
import config from "./key";
import { isNull } from "util";

class FirebaseHandler {
  constructor() {
    this.database = firebase.initializeApp(config, "database").database();
    this.getFirmNames = this.getFirmNames.bind(this);
    const that = this;
  }

  isRoomExist(roomNum, groupNum) {
    return this.database
      .ref(roomNum)
      .child("on")
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
    return this.database
      .ref(roomNum)
      .child("on")
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
    return this.database
      .ref(roomNum)
      .child("on")
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
    return this.database
      .ref(roomNum)
      .child("on")
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
    quantity
  ) {
    return this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .child(`round${roundNum}`)
      .child(`${groupNum}`)
      .set(
        {
          isBorrowing: borrowing > 0,
          numBorrowing: borrowing,
          quantityProduction: quantity,
          returning,
          submit: true
        },
        console.log("test")
      );
  }

  compareFirmNum(roomNum, roundNum) {
    return this.database // 'return' because need of 'then chain'
      .ref(roomNum)
      .child("on")
      .child("roomInfo")
      .child("firmNum")
      .once("value")
      .then(firmNum => {
        console.log(firmNum.val());
        return this.database
          .ref(roomNum)
          .child("on")
          .child("round")
          .child(`round${roundNum}`)
          .once("value")
          .then(snap => {
            console.log(snap.val());
            console.log(Object.keys(snap.val()).length);
            return Object.keys(snap.val()).length == firmNum.val();
          });
      });
  }

  getData(ref) {
    // Pass in a reference path and return a Promise
    return ref.once("value").then(snap => {
      if (!isNull(snap.val())) {
        return Promise.resolve(snap.val());
      } else {
        return Promise.reject(new Error(ref + " is empty"));
      }
    });
  }

  async calculateUnitPrice(roomNum, roundNum) {
    var roomInfo = this.database // Simplifying a path for future use
      .ref(roomNum)
      .child("on")
      .child("roomInfo");

    var totalQuantityInThisRound = 0;
    var constant_v = await this.getData(roomInfo.child("constant"));
    var slope_v = await this.getData(roomInfo.child("slope"));
    var firmNum_v = await this.getData(roomInfo.child("firmNum"));
    var unitPrice = 0;
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
        )
      );
      totalQuantityInThisRound += parseInt(companyQuantity_v);
    }
    unitPrice =
      parseFloat(constant_v) +
      parseFloat(slope_v) * parseInt(totalQuantityInThisRound);
    if (unitPrice < 0) {
      unitPrice = 0;
    }
    console.log(`Constant ${constant_v}`);
    console.log(`Slope ${slope_v}`);
    if ((await this.getData(roomInfo.child("marketType"))) !== "monoply") {
      this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .update({
          price: unitPrice
        });
    } else {
      for (i = 1; i <= firmNum_v; i++) {
        this.database
          .ref(roomNum)
          .child("on")
          .child("round")
          .child(`round${roundNum}`)
          .child(i)
          .update({
            price:
              constant_v +
              slope_v *
                this.database
                  .ref(roomNum)
                  .child("on")
                  .child("round")
                  .child(`round${roundNum}`)
                  .child(i)
                  .child("quantityProduction")
          });
      }
    }
  }

  async calculateUnitCost(roomNum, roundNum) {
    var roomInfo = this.database // Simplifying a path for future use
      .ref(roomNum)
      .child("on")
      .child("roomInfo");
    var firmNum_v = parseInt(await this.getData(roomInfo.child("firmNum")));
    var companyNum = this.database.ref(roomNum).child("on");

    for (var i = 1; i <= firmNum_v; i++) {
      var c1 = companyNum.child(`company_${i}`).child("coefficientOne");
      var c2 = companyNum.child(`company_${i}`).child("coefficientTwo");
      var c3 = companyNum.child(`company_${i}`).child("coefficientThree");
      var constant = companyNum.child(`company_${i}`).child("constant"); // not the previous constant!
      var companyQuantity = this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .child(i)
        .child("quantityProduction");
      var c1_v = parseFloat(await this.getData(c1));
      var c2_v = parseFloat(await this.getData(c2));
      var c3_v = parseFloat(await this.getData(c3));
      var constant_v = parseFloat(await this.getData(constant));
      var companyQuantity_v = parseFloat(await this.getData(companyQuantity));
      var totalCost =
        c1_v * companyQuantity_v +
        c2_v * companyQuantity_v * companyQuantity_v +
        c3_v * companyQuantity_v * companyQuantity_v * companyQuantity_v +
        constant_v;
      this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .child(i)
        .update({
          unitCost: totalCost / companyQuantity_v
        });
    }
  }

  async calculateProfit(roomNum, roundNum) {
    var roomInfo = this.database // Simplifying a path for future use
      .ref(roomNum)
      .child("on")
      .child("roomInfo");
    var whichFirm = this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .child(`round${roundNum}`);
    var firmNum_v = parseInt(await this.getData(roomInfo.child("firmNum")));
    var unitPrice;
    for (var i = 1; i <= firmNum_v; i++) {
      if ((await this.getData(roomInfo.child("marketType"))) !== "monoply") {
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
    var firmNum_v = parseInt(await this.getData(roomInfo.child("firmNum")));
    var unitPrice;
    for (var i = 1; i <= firmNum_v; i++) {
      if ((await this.getData(roomInfo.child("marketType"))) !== "monoply") {
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
      this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .child(`round${roundNum}`)
        .child(i)
        .update({
          revenue: unitPrice_v * companyQuantity_v
        });
      console.log(`this is loop ${i}`);
    }
  }

  falsifyEndroundbutton(roomNum) {
    this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .update({
        endroundbutton: false
      });
  }

  getCompanyName(roomNum, groupNum) {
    return this.database
      .ref(roomNum)
      .child("on")
      .child("company_" + groupNum)
      .child("companyName")
      .once("value")
      .then(snap => {
        if (!isNull(snap.val())) {
          return Promise.resolve(snap.val());
        } else {
          return Promise.reject(new Error("Round Number is empty"));
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
    return this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .once("value")
      .then(function(data) {
        const informationOfEachRound = data.val();
        for (var i = 1; i <= currentRound; i++) {
          console.log(informationOfEachRound["round" + i]);
          unitCostPerRounds[i] =
            informationOfEachRound["round" + i][groupNum].unitCost;
          revenuePerRounds[i] =
            informationOfEachRound["round" + i][groupNum].revenue;
          profitPerRounds[i] =
            informationOfEachRound["round" + i][groupNum].profit;
          if (marketType === "monoply") {
            pricePerRounds[i] =
              informationOfEachRound["round" + i][groupNum].price;
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
        for (var u = 1; u <= parseInt(totalFirmNumber); u++) {
          accumprofitPerCompany[nameList[u]] = 0;
        }
        return accumprofitPerCompany;
      };
      const initRoundArray = totalFirmNumber => {
        const rounds = {};
        for (var k = 1; k <= parseInt(totalFirmNumber); k++) {
          rounds[nameList[k]] = {};
        }
        return rounds;
      };
      const profitPerCompany = {};
      const accumprofitPerCompany = initAccumProfitPerCompany(totalFirmNumber);
      const roundArray = initRoundArray(totalFirmNumber);
      return this.database
        .ref(roomNum)
        .child("on")
        .child("round")
        .once("value")
        .then(function(data) {
          const informationOfEachRound = data.val();
          for (var i = 1; i <= currentRound; i++) {
            for (var t = 1; t <= parseInt(totalFirmNumber); t++) {
              roundArray[nameList[t]][i] = parseInt(
                informationOfEachRound["round" + i][t].quantityProduction
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
          return {
            profitPerCompany,
            accumprofitPerCompany,
            roundArray
          };
        });
    });
  }

  getFirmNames(roomNum, totalFirmNumber) {
    const database = this.database;
    const nameList = {};
    return (function loop(i) {
      if (i <= totalFirmNumber) {
        return new Promise((resolve, reject) => {
          database
            .ref(roomNum)
            .child("on")
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
    return this.database
      .ref(roomNum)
      .child("on")
      .child("round")
      .child("endSession")
      .on("value", snap => {
        cb(snap.val());
      });
  }

  getCompanyRoundStatusListener(roomNum, groupNum, cb) {
    console.log(roomNum);
    console.log(groupNum);
    this.database
      .ref(roomNum)
      .child("on")
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
}
export default FirebaseHandler;
