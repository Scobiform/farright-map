import React from 'react';
import DistrictChart from '@components/Chart/DistrictChart';
import styles from './DistrictCard.module.css';

// Helper function to handle missing data
const handleMissingData = (value) => value ?? 'N/A';

const KeyValueList = ({ data }) => {
    if (!data) return null;

    return (
        <ul className={styles.cardList}>
            {Object.entries(data).map(([key, value]) => (
                <li key={key}>
                    <strong>{key}:</strong> {handleMissingData(value)}
                </li>
            ))}
        </ul>
    );
};

const ElectionTable = ({ tableData }) => {
    if (!tableData || tableData.length === 0) return <p>No table data available</p>;

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Party</th>
                    <th>Candidate</th>
                    <th>First Votes</th>
                    <th>First Vote %</th>
                    <th>Second Votes</th>
                    <th>Second Vote %</th>
                </tr>
            </thead>
            <tbody>
                {tableData.map((row, index) => (
                    <tr key={index}>
                        <td>{handleMissingData(row.party)}</td>
                        <td>{handleMissingData(row.candidate)}</td>
                        <td>{handleMissingData(row.firstVotes)}</td>
                        <td>{handleMissingData(row.firstVotePercentage)}</td>
                        <td>{handleMissingData(row.secondVotes)}</td>
                        <td>{handleMissingData(row.secondVotePercentage)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const ChartContainer = ({ charts }) => {
    if (!charts || charts.length === 0) return <p>No chart data available</p>;

    return charts.map((chart, index) => (
        <DistrictChart key={index} chart={chart} />
    ));
};

const renderSvgData = (svgDataArray) => {
    if (!svgDataArray || svgDataArray.length === 0) return <p>No SVG data available</p>;

    return (
        <div className={styles.svgContainer}>
            {svgDataArray.map((svgObject, index) => (
                <div
                    key={index}
                    className={styles.svgItem}
                    dangerouslySetInnerHTML={{ __html: Object.values(svgObject)[0] }} // Render the SVG string
                />
            ))}
        </div>
    );
};

const renderElect = ({ 
    svgData, 
    svgDataCharts, 
    tableData, 
    statisticsData, 
    electedData, 
    voterTurnout, 
    voterTurnoutChart, 
    state, 
    name 
}) => {
    return (
        <div className={styles.card}>
            {/* Ensure the name is rendered at the top */}
            {name && <h1>{name}</h1>}

            {/* Render elected data only for Brandenburg */}
            {state === 'brandenburg' && electedData && (
                <>
                    <h3>Voter Turnout</h3>
                    <VoterTurnout voterTurnout={voterTurnout} />
                    <VoterTurnoutMap voterTurnoutChart={voterTurnoutChart} />
                    <h3>Elected Candidate</h3>
                    <div className={styles.electedCard}>
                        <p><strong>Name:</strong> {handleMissingData(electedData.electedPerson.name)}</p>
                        <p><strong>Party:</strong> {handleMissingData(electedData.electedPerson.party)}</p>
                        <p><strong>Percentage:</strong> {handleMissingData(electedData.electedPerson.percentage)}</p>
                    </div>
                    <h4>Runner-up</h4>
                    <div className={styles.electedCard}>
                        <p><strong>Name:</strong> {handleMissingData(electedData.runnerUpPerson.name)}</p>
                        <p><strong>Party:</strong> {handleMissingData(electedData.runnerUpPerson.party)}</p>
                        <p><strong>Percentage:</strong> {handleMissingData(electedData.runnerUpPerson.percentage)}</p>
                    </div>
                </>
            )}

            {/* Render SVG data if available */}
            {svgData && (
                <>
                    <h3>Election Visualization</h3>
                    {renderSvgData(svgData)}
                </>
            )}

            {/* Render the election results table if available */}
            {tableData && (
                <>
                    <h3>Election Results</h3>
                    <ElectionTable tableData={tableData} />
                </>
            )}

            {/* Render election statistics if available */}
            {statisticsData && (
                <>
                    <h3>Election Statistics</h3>
                    <ul className={styles.cardList}>
                        {statisticsData
                            .filter(item => item.label !== 'N/A')
                            .map((item, index) => (
                                <li key={index}>
                                    <strong>{item.label}:</strong> {handleMissingData(item.value)}
                                </li>
                            ))}
                    </ul>
                </>
            )}


            {/* Render SVG charts if available */}
            {svgDataCharts && (
                <>
                    <h3>SVG Charts</h3>
                    <ChartContainer charts={svgDataCharts} />
                </>
            )}
        </div>
    );
};


const VoterTurnout = ({ voterTurnout }) => {
    if (!voterTurnout) return null;

    return (
        <div className={styles.turnoutCard}>
            <strong>Voter Turnout:</strong> {voterTurnout}%
        </div>
    );
};

const VoterTurnoutMap = ({ voterTurnoutChart }) => {
    if (!voterTurnoutChart || !voterTurnoutChart.svg) return <p>No map data available</p>;

    return (
        <div className={styles.mapContainer}>
            <h3>Voter Turnout Map</h3>
            <div dangerouslySetInnerHTML={{ __html: voterTurnoutChart.svg }} />
        </div>
    );
};

const DistrictCard = ({ district, state }) => {
    if (!district) {
        return <p>No district data available</p>;
    }

    // Check if voter turnout data exists
    const { voterTurnout, voterTurnoutChart } = district;

    if (district.tableData) {
        return renderElect({ ...district, state });
    }

    if (district.bezeichnung) {
        return (
            <div className={styles.card}>
                {district.name && <h3 className={styles.cardHeader}>{district.name}</h3>}
                <KeyValueList data={{
                    Name: district.name,
                    Link: district.link,
                    Candidate: district.candidate,
                    'Link Reason': district.linkReason,
                    Methodology: district.methodology,
                    'Updated At': district.updatedAt,
                    Counted: district.counted,
                    'To Count': district.toCount,
                }} />
                {district.charts && <ChartContainer charts={district.charts} />}
            </div>
        );
    }

    return (
        <div className={styles.card}>
            {district.name && <h3 className={styles.cardHeader}>{district.name}</h3>}
            <KeyValueList data={district} />
        </div>
    );
};

export default DistrictCard;
