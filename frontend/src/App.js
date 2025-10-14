import React from 'react';
import ReturnsOfFundLineChart from './components/ReturnsOfFundLineChart';

function App() {
  return (
    // <div className="container mt-5">
    <div className="container-fluid d-flex flex-column align-items-center">
      <div className="row w-100 mt-4">
        <h3 className="text-center">资金收益</h3>
      </div>
      <div className="row w-100">
        <div className="col-md-12">
          <ReturnsOfFundLineChart />
        </div>
      </div>
    </div>
  );
}

export default App;