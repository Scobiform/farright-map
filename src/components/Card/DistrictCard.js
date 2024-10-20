import React from 'react';
import DistrictChart from '@components/Chart/DistrictChart';
import styles from './DistrictCard.module.css';

// Helper function to handle missing data
const handleMissingData = (value) => value ?? 'N/A';

// Helper component to render key-value pairs
const KeyValueList = ({ data }) => {
    if (!data) return null;

    return (
        <ul className={styles.cardList}>
            {Object.entries(data).map(([key, value]) => (
                <li key={key}>
                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : handleMissingData(value)}
                </li>
            ))}
        </ul>
    );
};

// Helper component to render the election table
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

// Helper component to render SVG charts
const ChartContainer = ({ charts }) => {
    if (!charts || charts.length === 0) return <p>No chart data available</p>;

    return charts.map((chart, index) => (
        <DistrictChart key={index} chart={chart} />
    ));
};

// Helper function to render SVG data
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

// render electIT data
const renderElect = ({ svgData, 
    svgDataCharts, 
    tableData, 
    statisticsData, 
    electedData,
    state,
    name }) => {
    return (
        <div className={styles.card}>
            {/* Render elected data only for Brandenburg */}
            {(state === 'brandenburg') && electedData && (
                <>
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
            {/* Render elected data for Schleswig-Holstein */}
            {(state === 'sh') && electedData && (
                <>
                <h3>Elected Candidate</h3>
                <div className="gewaehlter__container">
                    {/* Winner */}
                    <div className="gewaehlter-direktbewerber">
                    <p className="gewaehlter-direktbewerber__person">
                        <i className="material-icons gewaehlter-direktbewerber__icon">account_circle</i>
                        <strong className="gewaehlter-direktbewerber__name">
                        {handleMissingData(electedData.electedPerson.name)}
                        </strong>
                    </p>
                    <p className="gewaehlter-direktbewerber__details">
                        <span className="partei gewaehlter-direktbewerber__partei">
                        <span className="partei__farbe" style={{ color: '#000000' }}></span>
                        <span className="partei__name">CDU</span>
                        </span>
                        <strong className="gewaehlter-direktbewerber__value">
                        {handleMissingData(electedData.electedPerson.percentage)}&nbsp;%
                        </strong>
                    </p>
                    </div>
                    {/* Runner-up */}
                    <div className="erstunterlegener">
                    <h4 className="erstunterlegener__label">Zweitplatzierung</h4>
                    <p className="erstunterlegener__content"></p>
                    <div className="erstunterlegener__name">
                        {handleMissingData(electedData.runnerUpPerson.name)}
                    </div>
                    <span className="partei erstunterlegener__partei">
                        <span className="partei__farbe" style={{ color: '#e0001a' }}></span>
                        <span className="partei__name">SPD</span>
                    </span>
                    <span className="erstunterlegener__value">
                        {handleMissingData(electedData.runnerUpPerson.percentage)}&nbsp;%
                    </span>
                    <p></p>
                    </div>
                </div>
                </>
            )}
            {/* Render elected data for Bremen */}
            {(state === 'bremen') && electedData && (
                <>
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
            {/* Render SVG data for all states */}
            {svgData && (
                <>
                    <h3>Election Visualization</h3>
                    {renderSvgData(svgData)}
                </>
            )}
            {tableData && (
                <>
                    <h3>Election Results</h3>
                    <ElectionTable tableData={tableData} />
                </>
            )}
            {statisticsData && (
                <>
                    <h3>Election Statistics</h3>
                    <ul className={styles.cardList}>
                        {statisticsData.map((item, index) => (
                            <li key={index}>
                                <strong>{item.label}:</strong> {handleMissingData(item.value)}
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {svgDataCharts && (
                <>
                    <h3>SVG Charts</h3>
                    <ChartContainer charts={svgDataCharts} />
                </>
            )}
        </div>
    );
};

// render ITNRW data
const renderITnrw = (district, state) => {
    return (
        <div className="district-card">
            <h3>{district.districtName}</h3>
            {district.firstVotes ? (
            <>
                <h4>First Votes</h4>
                <ul>
                {Object.entries(district.firstVotes).map(([party, percentage]) => (
                    <li key={party}>
                    <strong>{party}</strong>: {percentage}
                    </li>
                ))}
                </ul>
            </>
            ) : (
            <p>No data available for first votes</p>
            )}

            {district.secondVotes ? (
            <>
                <h4>Second Votes</h4>
                <ul>
                {Object.entries(district.secondVotes).map(([party, percentage]) => (
                    <li key={party}>
                    <strong>{party}</strong>: {percentage}
                    </li>
                ))}
                </ul>
            </>
            ) : (
            <p>No data available for second votes</p>
            )}
        </div>
    );      
};

const DistrictCard = ({ district, state }) => {
    if (!district) {
        return <p>No district data available</p>;
    }

    // Render specific details when 'bezeichnung' exists
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

    // Handle different states
    switch (state) {
        case 'bundestag':
        case 'brandenburg':
        case 'berlin':
        case 'bremen':
        case 'sh':
            // Render with 'renderElect' for specific states
            return renderElect({ ...district, state });
        case 'nrw':
            // Render with 'renderITnrw' for NRW
            return renderITnrw(district, state);
        default:
            // Default rendering for other states
            return (
                <div className={styles.card}>
                    {district.name && <h3 className={styles.cardHeader}>{district.name}</h3>}
                    <KeyValueList data={district} />
                </div>
            );
    }
};

export default DistrictCard;
