const renderExternalDistrictData = (data) => {
    console.log(data);
    const renderValue = (key, value) => {
        // Handle null or undefined values
        if (value === null || value === undefined) {
            return 'N/A'; // or any placeholder for missing data
        }

        // Handle arrays and objects separately
        if (Array.isArray(value)) {
            return (
                <ul>
                    {value.map((item, index) => (
                        <li key={index}>
                            {typeof item === 'object' ? JSON.stringify(item) : item.toString()}
                        </li>
                    ))}
                </ul>
            );
        } else if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }

        return value.toString();
    };

    return (
        <div>
            {/* Check if data exists */}
            {data ? (
                <>
                    {/* Display district name if available */}
                    {data.name && <h3>{data.name}</h3>}

                    {/* Display key-value pairs, handling objects with JSON.stringify */}
                    <ul>
                        {Object.entries(data).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {renderValue(key, value)}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p>No district data available</p>
            )}
        </div>
    );
};

const DistrictCard = ({ district }) => {
    const renderValue = (key, value) => {
        // Handle null or undefined values
        if (value === null || value === undefined) {
            return 'N/A'; // or any placeholder for missing data
        }

        // Handle arrays and objects separately
        if (Array.isArray(value)) {
            return (
                <ul>
                    {value.map((item, index) => (
                        <li key={index}>
                            {typeof item === 'object' ? JSON.stringify(item) : item.toString()}
                        </li>
                    ))}
                </ul>
            );
        } else if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }

        return value.toString();
    };

    // Check if the district object has a "bezeichnung" (external district data)
    if (district && district.bezeichnung) {
        return renderExternalDistrictData(district);
    }
    // Default rendering for other district data
    else {
        return (
            <div className="card">
                <div className="card-body">
                    {/* Check if district object exists */}
                    {district ? (
                        <>
                            {/* Display district name if available */}
                            {district.name && <h3>{district.name}</h3>}

                            {/* Display key-value pairs, handling objects and arrays gracefully */}
                            <ul>
                                {Object.entries(district).map(([key, value]) => (
                                    <li key={key}>
                                        <strong>{key}:</strong> {renderValue(key, value)}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>No district data available</p>
                    )}
                </div>
            </div>
        );
    }
};

export default DistrictCard;
