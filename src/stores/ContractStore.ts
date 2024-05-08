// stores/ContractStore.js
import { makeAutoObservable } from "mobx";
class ContractStore {
  contracts = [];
  balance = {
    RUB: "0.00",
    USD: "0.00",
    IND: "0.00",
  };
   
  constructor() {
    makeAutoObservable(this);
  }

  // Action to set contracts
  setContracts(contracts) {
    this.contracts = contracts;
  }
 

  setBalance(currency,balance){
    this.balance[currency] = balance;
  }
  // Computed value to get contracts
  get contractsData() {
    return this.contracts;
  }
}

const contractStore = new ContractStore();
export default contractStore;
