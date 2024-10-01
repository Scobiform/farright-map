import React, { useState, useEffect } from 'react';

export default function PersonCard({ person, orgName, socialLinks = [] }) {
  const [personData, setPersonData] = useState(person);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [admin, setAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attributes, setAttributes] = useState(() => {
    return typeof person.attributes === 'string'
      ? JSON.parse(person.attributes)
      : person.attributes || {};
  });

  useEffect(() => {
    setPersonData(person);
    setAttributes(
      typeof person.attributes === 'string'
        ? JSON.parse(person.attributes)
        : person.attributes || {}
    );
  }, [person]);

  const handleAddAttribute = () => {
    if (!newAttrKey || !newAttrValue) return;
    setAttributes({
      ...attributes,
      [newAttrKey]: newAttrValue
    });
    setNewAttrKey('');
    setNewAttrValue('');
  };

  const handleUpdateAttribute = (key, value) => {
    setAttributes({
      ...attributes,
      [key]: value
    });
  };

  const handleDeleteAttribute = (key) => {
    const updatedAttributes = { ...attributes };
    delete updatedAttributes[key];
    setAttributes(updatedAttributes);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/person', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...personData, attributes }),
      });
      const data = await response.json();
      if (response.ok) {
        setPersonData(data);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Error updating person');
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...personData, attributes }),
      });
      const data = await response.json();
      if (response.ok) {
        setPersonData(data);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Error creating person');
    }
  };

  // Recursive function to render nested attributes
  const renderAttributes = (obj) => {
    return Object.entries(obj).map(([key, value]) => {
      const isUrl = typeof value === 'string' && value.startsWith('https://');
      if (isUrl) {
        return (
          <li key={key}>
            <strong>{key}:</strong>{' '}
            <a href={value || '#'} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          </li>
        );  
      }

      if (typeof value === 'object' && value !== null) {
        return (
          <li key={key}>
            <strong>{key}:</strong>
            <ul>{renderAttributes(value)}</ul>
          </li>
        );
      }
      return (
        <li key={key}>
          <strong>{key}:</strong> {value}
        </li>
      );
    });
  };

  if (!admin) {
    return (
      <div>
        <button onClick={() => setAdmin(true)}>EDIT</button>
        <h2>{personData.name}</h2>
        <p className="left">{orgName}</p>
        {attributes && Object.keys(attributes).length > 0 ? (
          <ul>{renderAttributes(attributes)}</ul>
        ) : (
          <ul>
            {Object.entries(personData).map(([key, value]) => {
              if (!value || ['name', 'organization', 'attributes'].includes(key)) {
                return null;
              }
              return (
                <li key={key}>
                  {key}: {value}
                </li>
              );
            })}
          </ul>
        )}
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
  } else {
    return (
      <div>
        <button onClick={() => setAdmin(false)}>View</button>
        <h2>{personData.name}</h2>
        <p className="left">{orgName}</p>
        <ul>
          {Object.entries(personData).map(([key, value]) => {
            if (!value || ['name', 'organization', 'attributes'].includes(key)) {
              return null;
            }
            return (
              <li key={key}>
                {key}: {value}
              </li>
            );
          })}
        </ul>
        <h3>Attributes</h3>
        <ul>
          {Object.entries(attributes).map(([key, value]) => (
            <li key={key}>
              <input
                type="text"
                value={value}
                onChange={(e) => handleUpdateAttribute(key, e.target.value)}
              />
              <button onClick={() => handleDeleteAttribute(key)}>Delete</button>
            </li>
          ))}
        </ul>
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
        <button onClick={handleUpdate}>Update</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    );
  }
}
