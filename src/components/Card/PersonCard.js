import React, { useState, useEffect } from 'react';
import styles from './PersonCard.module.css';

export default function PersonCard({ person, orgName, socialLinks = [] }) {
  // Function to generate attributes from person object if attributes are missing
  const generateAttributesFromPerson = (personObj) => {
    const { attributes, socialLinks, ...rest } = personObj;
    return { ...rest, socialMedia: socialLinks };
  };

  const [personData, setPersonData] = useState(person);
  const [newPlatform, setNewPlatform] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [admin, setAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [attributes, setAttributes] = useState(() => {
    // Initialize attributes from person or generate them if missing
    return person.attributes && typeof person.attributes === 'string'
      ? JSON.parse(person.attributes)
      : person.attributes || generateAttributesFromPerson({ ...person, socialLinks });
  });

  useEffect(() => {
    setPersonData(person);
    setAttributes(
      person.attributes && typeof person.attributes === 'string'
        ? JSON.parse(person.attributes)
        : person.attributes || generateAttributesFromPerson({ ...person, socialLinks })
    );
  }, [person]);

  // Function to add a new social media link
  const handleAddSocialMedia = () => {
    if (!newPlatform || !newPlatformUrl) return;
    setAttributes((prevAttributes) => {
      const updatedSocialMedia = [
        ...(prevAttributes.socialMedia || []),
        { platform: newPlatform, url: newPlatformUrl },
      ];
      return { ...prevAttributes, socialMedia: updatedSocialMedia };
    });
    setNewPlatform('');
    setNewPlatformUrl('');
  };

  // Function to delete a social media link
  const handleDeleteSocialMedia = (platform) => {
    setAttributes((prevAttributes) => {
      const updatedSocialMedia = (prevAttributes.socialMedia || []).filter(
        (link) => link.platform !== platform
      );
      return { ...prevAttributes, socialMedia: updatedSocialMedia };
    });
  };

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
    setAttributes((prevAttributes) => {
      // Handle nested keys (e.g., socialMedia array)
      if (key.includes('.')) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let nested = { ...prevAttributes };
        let temp = nested;
        keys.forEach((k) => {
          temp[k] = { ...temp[k] };
          temp = temp[k];
        });
        temp[lastKey] = value;
        return nested;
      } else {
        return {
          ...prevAttributes,
          [key]: value,
        };
      }
    });
  };

  // Function to delete an attribute
  const handleDeleteAttribute = (key) => {
    setAttributes((prevAttributes) => {
      const updatedAttributes = { ...prevAttributes };
      delete updatedAttributes[key];
      return updatedAttributes;
    });
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
        setErrorMessage(data.message || 'Error updating person');
      }
    } catch (error) {
      setErrorMessage('Error updating person');
    }
  };

  // Function to render attributes
  const renderAttributes = (obj) => {
    const entries = Object.entries(obj);

    // Separate image attribute from the rest
    const imageEntry = entries.find(([key]) => key === 'image');
    const otherEntries = entries.filter(([key]) => key !== 'image');

    // Function to render each attribute
    const renderAttribute = ([key, value]) => {
      if (key === 'socialMedia' && Array.isArray(value)) {
        return (
          <div key={key}>
            <h3>Social Media</h3>
            <ul>
              {value.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.platform}: {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (typeof value === 'string' && value.startsWith('https://')) {
        return (
          <li key={key}>
            <strong>{key}:</strong>{' '}
            <a href={value} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          </li>
        );
      }

      if (typeof value === 'object' && value !== null) {
        return (
          <li key={key}>
            <strong>{key}:</strong> {JSON.stringify(value)}
          </li>
        );
      }

      return (
        <li key={key}>
          <strong>{key}:</strong> {value}
        </li>
      );
    };

    return (
      <>
        {imageEntry && (
          <img
            src={imageEntry[1]}
            alt={personData.name}
            style={{ maxWidth: '100px' }}
          />
        )}
        {otherEntries.map(renderAttribute)}
      </>
    );
  };

  // Render for non-admin view
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
      </div>
    );
  }

  // Admin view with your specified rendering
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
                  onChange={(e) => handleUpdateAttribute(key, e.target.value)}
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
                  onChange={(e) => handleUpdateAttribute(key, e.target.value)}
                />
              </>
            );
          }
          // Case for nested objects
          else if (typeof value === 'object' && value !== null) {
            // Handle socialMedia array
            if (key === 'socialMedia' && Array.isArray(value)) {
              inputElement = (
                <div>
                  <h3>Edit Social Media</h3>
                  <ul>
                    {value.map((link, index) => (
                      <li key={index}>
                        <strong>{link.platform}:</strong>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => {
                            const updatedLinks = value.map((item, idx) =>
                              idx === index
                                ? { ...item, url: e.target.value }
                                : item
                            );
                            handleUpdateAttribute('socialMedia', updatedLinks);
                          }}
                        />
                        <button
                          onClick={() => {
                            const updatedLinks = value.filter(
                              (_, idx) => idx !== index
                            );
                            handleUpdateAttribute('socialMedia', updatedLinks);
                          }}
                          className={styles.deleteButton}
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    placeholder="Platform"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={newPlatformUrl}
                    onChange={(e) => setNewPlatformUrl(e.target.value)}
                  />
                  <button onClick={handleAddSocialMedia}>Add Social Media</button>
                </div>
              );
            } else {
              // Handle other nested objects
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
              <strong>{key}:</strong> {inputElement}
              <button 
              onClick={() => handleDeleteAttribute(key)}
              className={styles.deleteButton}
              >🗑️</button>
            </li>
          );
        })}
      </ul>

      <hr />

      {/* Add a new attribute */}
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
          rows={4}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <button onClick={handleAddAttribute}>Add Attribute</button>
      </div>

      <hr />

      <button className={styles.updateButton} onClick={handleUpdate}>Update</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}
