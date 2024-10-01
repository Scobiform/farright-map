import React, { useState, useEffect } from 'react';

export default function PersonCard({ person, orgName, socialLinks = [] }) {
  const [personData, setPersonData] = useState(person);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setPersonData(person);
  }, [person]);

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

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });
      const data = await response.json();
      setPersonData(data);
    } catch (error) {
      console.error('Error creating person:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/person', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });
      const data = await response.json();
      setPersonData(data);
    } catch (error) {
      console.error('Error updating person:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/person', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: personData.id }),
      });
      setPersonData(null);
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  if (!admin) {
    return (
      <div>
        <button onClick={() => setAdmin(true)}>Admin</button>
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
  } else {
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
        <button onClick={handleUpdate}>Update</button>
      </div>
    );
  }
}