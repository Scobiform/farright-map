import React from 'react';
import styles from './DistrictChart.module.css'; // Make sure this path is correct

const DistrictChart = ({ chart }) => {
    return (
        <div className={styles.chartContainer}>
            {/* Render your chart */}
            <h3>{chart.title}</h3>
            {/* Other chart rendering logic */}
        </div>
    );
};

export default DistrictChart;
