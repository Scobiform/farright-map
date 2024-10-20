import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DistrictChart = ({ chartData, title }) => {
    if (!chartData || !chartData.data || chartData.data.length === 0) {
        return <p>No chart data available</p>;
    }

    // Assuming chartData.data is an array of objects where each object contains the party name and values for years
    const processedData = chartData.data.map(item => ({
        party: item.party,
        value_2018: item.value["2018"] || 0,
        value_2023: item.value["2023"] || 0
    }));

    return (
        <div>
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={processedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="party" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value_2018" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="value_2023" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DistrictChart;
