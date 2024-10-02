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

  // Function to add a new attribute
  const handleAddAttribute = () => {
    if (!newAttrKey || !newAttrValue) return;
    setAttributes({
      ...attributes,
      [newAttrKey]: newAttrValue
    });
    setNewAttrKey('');
    setNewAttrValue('');
  };

  // Function to update an attribute
  const handleUpdateAttribute = (key, value) => {
    setAttributes({
      ...attributes,
      [key]: value
    });
  };

  // Function to delete an attribute
  const handleDeleteAttribute = async (key) => {
    try {
      const response = await fetch('/api/person', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: personData.id, key }), // Include person ID and key to delete
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setAttributes((prevAttributes) => {
          const updatedAttributes = { ...prevAttributes };
          delete updatedAttributes[key];
          return updatedAttributes; // Return the updated object
        });
        setErrorMessage(''); // Clear any error message
      } else {
        setErrorMessage(data.message); // Show error message from the server
      }
    } catch (error) {
      setErrorMessage('Error deleting attribute');
    }
  };
  
  // Function to update the person's attributes
  const handleUpdate = async () => {
    try {
      const response = await fetch('/api/person', {
        method: 'PATCH',
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

  // Function to create a new person
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

  // Recursive function to render attributes, ensuring the image appears first
  const renderAttributes = (obj) => {
    const entries = Object.entries(obj);

    // Separate image attribute from the rest
    const imageEntry = entries.find(([key]) => key === 'image');
    const otherEntries = entries.filter(([key]) => key !== 'image');

    // Function to render each attribute
    const renderAttribute = ([key, value]) => {
      let element;

      switch (true) {
        // Case for URLs
        case typeof value === 'string' && value.startsWith('https://'):
          element = (
            <li key={key}>
              <strong>{key}:</strong>{' '}
              <a href={value || '#'} target="_blank" rel="noopener noreferrer">
                {value}
              </a>
            </li>
          );
          break;

        // case for number fields
        case typeof value === 'number':
          element = (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          );
          break;

        // Case for nested objects
        case typeof value === 'object' && value !== null:
          element = (
            <li key={key}>
              <strong>{key}:</strong>
              <ul>{renderAttributes(value)}</ul>
            </li>
          );
          break;
        
        // Default case for simple text fields
        default:
          element = (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          );
      }

      return element;
    };

    return (
      <>
        {/* Render image attribute first, if it exists */}
        {imageEntry && (
            <img src={imageEntry[1]} alt={personData.name} />
        )}

        {/* Render other attributes */}
        {otherEntries.map(renderAttribute)}
      </>
    );
  };

  // If the user is not admin
  if (!admin) {
    return (
      <div>
        <button onClick={() => setAdmin(true)}>EDIT</button>
        <h2>{personData.name}</h2>
        <p className="left">{orgName}</p>
        {attributes && Object.keys(attributes).length > 0 ? (
          <ul>
            {renderAttributes(attributes)}
          </ul>
        ) : (
          <p>No attributes available</p>
        )}

        {/* Render social media links */}
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
    // --------------------------------------------------
    // If the user is admin
    // --------------------------------------------------
    return (
      <div>
        <button onClick={() => setAdmin(false)}>View</button>
        <h2>{personData.name}</h2>
        <img src={attributes.image} alt={personData.name} style={{ maxWidth: '100px' }} />;
        
        <p className="left">{orgName}</p>

        <ul className='attributes-list'>
          {Object.entries(attributes).map(([key, value]) => {
            // Skip the "attributes" key if it's the top-level key to avoid duplication
            if (key === 'attributes' && typeof value === 'object') {
              return null;
            }
            
            let inputElement;

            // Case for image fields
            if (key === 'image' && typeof value === 'string') {
              inputElement = (
                <>
                  <img src={value} alt={personData.name} style={{ maxWidth: '100px' }} />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleUpdateAttribute(key, e.target.value)}
                  />
                </>
              );
            }
            // Case for URL fields
            else if (typeof value === 'string' && value.startsWith('https://')) {
              inputElement = (
                <>
                  <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleUpdateAttribute(key, e.target.value)}
                  />
                </>
              );
            }
            // Case for nested objects
            else if (typeof value === 'object' && value !== null) {
              inputElement = (
                <ul>
                  {Object.entries(value).map(([nestedKey, nestedValue]) => (
                    <li key={nestedKey}>
                      <strong>{nestedKey}:</strong>{' '}
                      <input
                        type="text"
                        value={nestedValue}
                        onChange={(e) =>
                          handleUpdateAttribute(`${key}.${nestedKey}`, e.target.value)
                        }
                      />
                    </li>
                  ))}
                </ul>
              );
            }
            // Default case for simple text fields
            else {
              inputElement = (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateAttribute(key, e.target.value)}
                />
              );
            }

            return (
              <li key={key}>
                <strong>{key}:</strong>{' '}
                {inputElement}
                <button onClick={() => handleDeleteAttribute(key)}>Delete</button>
              </li>
            );
          })}
        </ul>

        <hr />
        <p>Add a new attribute:</p>
        <div>
          <input
            type="text"
            placeholder="Attribute Key"
            value={newAttrKey}
            onChange={(e) => setNewAttrKey(e.target.value)}
          />
          <textarea
            placeholder="Attribute Value"
            value={newAttrValue}
            onChange={(e) => setNewAttrValue(e.target.value)}
            rows={4} // Adjust the number of rows as needed
            style={{ width: '100%', resize: 'vertical' }} // Optional styling
          />
          <button onClick={handleAddAttribute}>Add Attribute</button>
        </div>

        <hr />

        <button onClick={handleUpdate}>Update</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
    );

  }
}
