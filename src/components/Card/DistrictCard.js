

export default function DistrictCard({ district }) {
    
    return (
        <div className="card">
        <div className="card-body">
            <h3>{name}</h3>
            <br />
            {district && (
                <>
                    {/* First, find the name and display it in an h4 */}
                    {Object.entries(district).map(([key, value]) =>
                    key.toLowerCase().includes("name") ? (
                        <h2 key={key}>{value}</h2>
                    ) : null
                    )}

                    {/* Then, display the remaining key-value pairs */}
                    <ul>
                    {Object.entries(district).map(([key, value]) =>
                        !key.toLowerCase().includes("name") ? (
                        <li key={key}>
                            <strong>{key}:</strong> {value}
                        </li>
                        ) : null
                    )}
                    </ul>
                </>
                )}
        </div>
        </div>
    );
}