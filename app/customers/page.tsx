
import React from "react";
import CustomerHeader from "./components/CustomerHeader";
import CustomerList from "./components/CustomerList";
import CustomerStats from "./components/CustomerStats";

const page = () => {
  // const newCustomers = customers.slice(-5); // Assuming last 5 are new customers
  // const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  // const outStandingCustomers = customers.filter(
  //   (c) => c.creditBalance > 0
  // ).length;

  return (
    <div className="flex flex-col gap-3">
      <CustomerHeader />
      <CustomerStats />
      <CustomerList />
    </div>
  );
};

export default page;
