export default function PersonCard({ person, orgName, socialLinks = [] }) {

  return (
    <div>
      <h2>
        {person.name}
        <p className="left">{orgName}</p>
      </h2>
      <ul>
        {Object.entries(person).map(([key, value]) => {
          if (!value || ['name', 'organization', 'lat', 'lon'].includes(key)) {
            return null;
          }
          return (
            <li key={key}>
              {key}: {value}
            </li>
          );
        })}
      </ul>
      <hr />
      {socialLinks.length > 0 && (
        <>
          <h3>Social Media</h3>
          <ul>
            {socialLinks.map((link, index) => (
              <li key={index}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
