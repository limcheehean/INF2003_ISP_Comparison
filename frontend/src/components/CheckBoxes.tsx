import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/joy/Typography';

interface FormElements extends HTMLFormControlsCollection {
    company_ids:HTMLInputElement;
    ward_types: HTMLInputElement;
    plan_ids: HTMLInputElement;
}

interface CalculateFormElement extends HTMLFormElement {
    readonly elements: FormElements;
}

interface ApiResponse {
  data: {
    companies: { id: number; name: string }[];
    plans: { id: number; name: string }[];
    riders: { id: number; name: string }[];
    wards: string[];
  };
  status: string;
}
// use useEffect and have a state for it so that the data will be displayed upon entry
// display it in the list!! see isaac's!!! 

export default function Checkboxes() {
    const [company_ids, set_company_ids] = React.useState('');
    const [ward_types, set_ward_types] = React.useState('');
    const [plan_ids, set_plan_ids] = React.useState('');
    //const [rider_ids, set_rider_ids] = React.useState('');
    const [responseData, setResponseData] = React.useState<ApiResponse>({
      data: {
        companies: [],
        plans: [],
        riders: [],
        wards: [],
      },
      status: 'succeess',
    });

    const handleCheckboxChange = async () => {
        const postData = {
            company_ids,
            ward_types,
            plan_ids,
        }

        // try {
        //     console.log(postData);
        //     const response = await axios.post('/api/get_filter', postData, { headers: { 'Content-Type': 'application/json' } })
        //     console.log('Response', response.data);
        //     setResponseData(response.data); // Setting the response data in the state
        // } catch (error) {
        //     console.log('Error', error);
        // }
        try {
          const response = await axios.post<ApiResponse>('/api/get_filter', postData, {
            headers: { 'Content-Type': 'application/json' },
          });
          setResponseData(response.data);
        } catch (error) {
          console.log('Error', error);
        }
    };

    return (
        <div>
          <div>
            <h2>Companies:</h2>
            {responseData.data.companies.map((company) => (
              <div key={company.id}>
                <input
                  type="checkbox"
                  value={company.id}
                  onChange={() => {
                    // Handle checkbox change if needed
                  }}
                />
                <label>{company.name}</label>
              </div>
            ))}
          </div>
          <div>
            <h2>Ward Types:</h2>
            {responseData.data.wards.map((wardType, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  value={wardType}
                  onChange={() => {
                    // Handle checkbox change if needed
                  }}
                />
                <label>{wardType}</label>
              </div>
            ))}
          </div>
          <div>
            <h2>Plan IDs:</h2>
            {responseData.data.plans.map((plan) => (
              <div key={plan.id}>
                <input
                  type="checkbox"
                  value={plan.id}
                  onChange={() => {
                    // Handle checkbox change if needed
                  }}
                />
                <label>{plan.name}</label>
              </div>
            ))}
          </div>
          <div>
            <h2>Rider IDs:</h2>
            {responseData.data.riders.map((rider) => (
              <div key={rider.id}>
                <input
                  type="checkbox"
                  value={rider.id}
                  onChange={() => {
                    // Handle checkbox change if needed
                  }}
                />
                <label>{rider.name}</label>
              </div>
            ))}
          </div>
          <button onClick={handleCheckboxChange}>Submit</button>
        </div>
      );
}

    
// export const Companies = [
//     {
//         name: "AIA"
//     },
//     {
//         name: "Great Easter"
//     },
//     {
//         name: "HSBC"
//     },
//     {
//         name: "NTUC Income"
//     },
//     {
//         name: "Prudential"
//     },
//     {
//         name: "Singlife"
//     } 
// ];

// export const Plans = [
// ];

// export const Riders = [
//     {
//         name: "testing2"
//     },
//     {
//         name: "t4"
//     },
//     {
//         name: "t6"
//     },
//     {
//         name: "t8"
//     }
// ];