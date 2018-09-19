import firebase from 'firebase/app';
import 'firebase/database';
import config from './key'
import { isNull } from 'util';
class FirebaseHandler {
    constructor() {
        this.database = firebase.initializeApp(config,'database').database();
        this.getFirmNames = this.getFirmNames.bind(this)
    }
    isRoomExist(roomNum, groupNum){
        return this.database.ref(roomNum).child('on').child('company_'+groupNum).once('value').then((data)=>{
            if(isNull(data.val())){
                return Promise.reject(new Error('Sorry, the room or group number you provide is not valid. Please try again.'))
            }else{
                return Promise.resolve('success')
            }
        }).catch((e)=>{
            return Promise.reject(e)
        })
    }
    // getRoomInfo(roomNum){
    //     return this.database.ref(roomNum).child('on').child('roomInfo').once('value').then((data)=>{
    //         if(isNull(data.val())){
    //             return Promise.reject(new Error('Sorry, the room number you provide is not valid. Please try again'))
    //         }else{
    //             return Promise.resolve(data.val())
    //         }
    //     }).catch((e)=>{
    //         return Promise.reject(e)
    //     })
    // }
    getRoomInfo(roomNum, cb){
        return this.database.ref(roomNum).child('on').child('roomInfo').on('value', (snap)=>{
            if(!isNull(snap.val())){
                cb(snap.val());
            }else{
                cb(new Error('Room Info is empty'))
            }
        })
    }
    getCurrentRound(roomNum, cb){
        return this.database.ref(roomNum).child('on').child('round').child('currentRound').on('value', (snap)=>{
            if(!isNull(snap.val())){
                cb(snap.val());
            }else{
                cb(new Error('Round number is empty'));
            }
        })
    }
    getCompanyListener(roomNum, groupNum, cb){
        return this.database.ref(roomNum).child('on').child(`company_${groupNum}`).on('value', (snap)=>{
            cb(snap.val())
        })
    }
    getCompanyName(roomNum, groupNum){
        return this.database.ref(roomNum).child('on').child('company_'+groupNum).child('companyName').once('value').then((snap)=>{
            if(!isNull(snap.val())){
                return Promise.resolve(snap.val());
            }else{
                return Promise.reject(new Error('Round number is empty'));
            }
        }).catch((err)=>{
            return Promise.reject(new Error(err));
        })
    }
    getBusinessOperationData(roomNum, groupNum, roundNum, marketType){
        const currentRound = roundNum;
        const unitCostPerRounds = {}
        const revenuePerRounds = {}
        const profitPerRounds = {}
        const pricePerRounds = {}
        return this.database.ref(roomNum).child('on').child('round').once('value').then(function(data){
            const informationOfEachRound = data.val();
            for(var i = 1; i <= currentRound; i++){
                console.log(informationOfEachRound['round'+i])
                unitCostPerRounds[i] = informationOfEachRound['round'+i][groupNum].unitCost;
                revenuePerRounds[i] = informationOfEachRound['round'+i][groupNum].revenue
                profitPerRounds[i] = informationOfEachRound['round'+i][groupNum].profit
                if(marketType === 'monoply'){
                    pricePerRounds[i] = informationOfEachRound['round'+i][groupNum].price
                }else{
                    pricePerRounds[i-1] = informationOfEachRound['round'+i].price
                }    
            }
            return {
                unitCostPerRounds,
                revenuePerRounds,
                profitPerRounds,
                pricePerRounds
            }
        })
    }
    getCompetitorOutputData(roomNum, totalFirmNumber, currentRound){
        return this.getFirmNames(roomNum, totalFirmNumber).then((nameList)=>{
            const initAccumProfitPerCompany = (totalFirmNumber) => {
                const accumprofitPerCompany = {}
                for(var u = 1; u<= parseInt(totalFirmNumber); u++){
                    accumprofitPerCompany[nameList[u]] = 0
                }
                return accumprofitPerCompany
            } 
            const initRoundArray = (totalFirmNumber) => {
                const rounds = {};
                for(var k = 1; k <= parseInt(totalFirmNumber); k++){
                    rounds[nameList[k]] = {}
                }
                return rounds;
            }
            const profitPerCompany = {}
            const accumprofitPerCompany = initAccumProfitPerCompany(totalFirmNumber);
            const roundArray = initRoundArray(totalFirmNumber)
            return this.database.ref(roomNum).child('on').child('round').once('value').then(function(data){
                const informationOfEachRound = data.val();
                for(var i = 1; i <= currentRound; i++){
                    for(var t = 1; t<= parseInt(totalFirmNumber); t++){
                        roundArray[nameList[t]][i] = parseInt(informationOfEachRound['round'+i][t].quantityProduction)
                        if(i == currentRound){
                            profitPerCompany[nameList[t]] = parseFloat(informationOfEachRound['round'+i][t].profit)
                        }
                        accumprofitPerCompany[nameList[t]] = accumprofitPerCompany[nameList[t]] + parseFloat(informationOfEachRound['round'+i][t].profit)
                    }
                }
                return {
                    profitPerCompany,
                    accumprofitPerCompany,
                    roundArray
                }
            })
        })     
    }
    getFirmNames(roomNum, totalFirmNumber){
        const database = this.database;
        const nameList = {}
        return (function loop(i) {
            if (i <= totalFirmNumber){
                return new Promise((resolve, reject) => {
                database.ref(roomNum).child('on').child(`company_${i}`).child('companyName').once('value').then((snap)=>{
                    nameList[i] = snap.val()+`[${i}]`
                    console.log(nameList)
                    resolve(snap.val())
                })
             }).then(loop.bind(null, i+1));
            }else{
                return Promise.resolve(nameList)
            }
        })(1);
    }
    isEndSession(roomNum,cb){
        return this.database.ref(roomNum).child('on').child('round').child('endSession').on('value',(snap)=>{
            cb(snap.val())
        })
    }
    getCompanyRoundStatusListener(roomNum, groupNum, cb){
        this.database.ref(roomNum).child('on').child('round').on('value',((data)=>{
            const roundInfo = data.val()
            if(roundInfo['round'+roundInfo.currentRound] && roundInfo['round'+roundInfo.currentRound][groupNum]){
                cb(roundInfo['round'+roundInfo.currentRound][groupNum])
            }else{
                cb(null)
            }
        }))
    }
}
export default FirebaseHandler;