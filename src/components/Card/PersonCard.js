import React, { useState } from 'react';

export default function PersonCard({ person, orgName, socialLinks = [] }) {
  const [personData, setPersonData] = useState(person);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [admin, setAdmin] = useState(false);

  const handleAddAttribute = () => {
    setPersonData({
      ...personData,
      [newAttrKey]: newAttrValue
    });
    setNewAttrKey('');
    setNewAttrValue('');
  };

  const handleUpdateAttribute = (key, value) => {
    setPersonData({
      ...personData,
      [key]: value
    });
  };

  const handleDeleteAttribute = (key) => {
    const updatedData = { ...personData };
    delete updatedData[key];
    setPersonData(updatedData);
  };

  if(!admin) {
    return (
      
      <div>
                <button onClick={() => setAdmin(true)}>View</button>
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
  else {
    return (
      <div>
        <button onClick={() => setAdmin(false)}>View</button>
        <h2>
          {personData.name}
          <p className="left">{orgName}</p>
        </h2>
        <ul>
          {Object.entries(personData).map(([key, value]) => {
            if (!value || ['name', 'organization'].includes(key)) {
              return null;
            }
            return (
              <li key={key}>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateAttribute(key, e.target.value)}
                />
                <button onClick={() => handleDeleteAttribute(key)}>Delete</button>
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
        <div>
          <input
            type="text"
            placeholder="Attribute Key"
            value={newAttrKey}
            onChange={(e) => setNewAttrKey(e.target.value)}
          />
          <input
            type="text"
            placeholder="Attribute Value"
            value={newAttrValue}
            onChange={(e) => setNewAttrValue(e.target.value)}
          />
          <button onClick={handleAddAttribute}>Add Attribute</button>
        </div>
      </div>
    );
  }
}