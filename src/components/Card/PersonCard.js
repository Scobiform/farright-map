import React, { useState, useEffect } from 'react';

export default function PersonCard({ person, orgName, socialLinks = [] }) {
  // Function to generate attributes from person object if attributes are missing
  const generateAttributesFromPerson = (personObj) => {
    const { attributes, ...rest } = personObj; // Exclude attributes field if it exists
    return rest; // Use other fields as attributes
  };

  const [personData, setPersonData] = useState(person);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [admin, setAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attributes, setAttributes] = useState(() => {
    // Initialize attributes from person or fallback to other fields in person
    return person.attributes && typeof person.attributes === 'string'
      ? JSON.parse(person.attributes)
      : person.attributes || generateAttributesFromPerson(person);
  });

  useEffect(() => {
    setPersonData(person);
    setAttributes(
      person.attributes && typeof person.attributes === 'string'
        ? JSON.parse(person.attributes)
        : person.attributes || generateAttributesFromPerson(person)
    );
  }, [person]);

  // Function to add a new attribute
  const handleAddAttribute = () => {
    if (!newAttrKey || !newAttrValue) return;
    setAttributes({
      ...attributes,
      [newAttrKey]: newAttrValue,
    });
    setNewAttrKey('');
    setNewAttrValue('');
  };

  // Function to update an attribute
  const handleUpdateAttribute = (key, value) => {
    setAttributes({
      ...attributes,
      [key]: value,
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
        body: JSON.stringify({ id: personData.id, key }),
      });

      const data = await response.json();

      if (response.ok) {
        setAttributes((prevAttributes) => {
          const updatedAttributes = { ...prevAttributes };
          delete updatedAttributes[key];
          return updatedAttributes; 
        });
        setErrorMessage(''); // Clear any error message
      } else {
        setErrorMessage(data.message);
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

        // Case for number fields
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
              <strong>{key}:</strong> {Object.values(value).pop()}
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
        {imageEntry && !imageEntry[1].includes('<svg') && (
          <img src={imageEntry[1]} alt={personData.name} />
        )}
        {/* Render SVG image attribute */}
        {imageEntry && imageEntry[1].includes('<svg') && (
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(
              imageEntry[1]
            )}`}
            alt={personData.name}
          />
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
          <ul>{renderAttributes(attributes)}</ul>
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
    // If the user is admin
    return (
      <div>
        <button onClick={() => setAdmin(false)}>View</button>
        <h2>{personData.name}</h2>
        <img
          src={attributes.image}
          alt={personData.name}
          style={{ maxWidth: '100px' }}
        />

        <p className="left">{orgName}</p>

        <ul className="attributes-list">
          {Object.entries(attributes).map(([key, value]) => {
            let inputElement;

            // Case for image fields
            if (key === 'image' && typeof value === 'string') {
              inputElement = (
                <>
                  <img
                    src={value}
                    alt={personData.name}
                    style={{ maxWidth: '100px' }}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleUpdateAttribute(key, e.target.value)
                    }
                  />
                </>
              );
            }
            // Case for URL fields
            else if (typeof value === 'string' && value.startsWith('https://')) {
              inputElement = (
                <>
                  <a href={value} target="_blank" rel="noopener noreferrer">
                    {value}
                  </a>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleUpdateAttribute(key, e.target.value)
                    }
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
                          handleUpdateAttribute(
                            `${key}.${nestedKey}`,
                            e.target.value
                          )
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
                  onChange={(e) =>
                    handleUpdateAttribute(key, e.target.value)
                  }
                />
              );
            }

            return (
              <li key={key}>
                <strong>{key}:</strong> {inputElement}
                <button onClick={() => handleDeleteAttribute(key)}>
                  Delete
                </button>
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
            rows={4} //
            style={{ width: '100%', resize: 'vertical' }} 
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
