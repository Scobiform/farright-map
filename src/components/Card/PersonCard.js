import React, { useState, useEffect } from 'react';
import styles from './PersonCard.module.css';

// Fetch function to get social media links for a person
const fetchSocialMedia = async (personId) => {
  const response = await fetch(`/api/socialmedia/${personId}`);
  const data = await response.json();
  return data;
};

// Fetch function to get attributes for a person
const fetchAttributes = async (personId) => {
  const response = await fetch(`/api/personAttributes?personId=${personId}`);
  const data = await response.json();
  return data;
};

export default function PersonCard({ person, orgName }) {
  const [personData, setPersonData] = useState(person);
  const [socialMediaLinks, setSocialMediaLinks] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [newPlatform, setNewPlatform] = useState('');
  const [newPlatformUrl, setNewPlatformUrl] = useState('');
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  // Fetch social media links and attributes when the component mounts or person changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [links, attrs] = await Promise.all([
          fetchSocialMedia(person.id),
          fetchAttributes(person.id),
        ]);
        setSocialMediaLinks(links);
        setAttributes(attrs);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    loadData();
  }, [person]);

  // Extract image attribute from attributes
  const imageAttribute = attributes.find((attr) => attr.key === 'image');

  // Handle input changes for person data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPersonData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle adding a new social media link
  const handleAddSocialMedia = () => {
    if (newPlatform && newPlatformUrl) {
      setSocialMediaLinks((prevLinks) => [
        ...prevLinks,
        { id: Date.now(), platform: newPlatform, url: newPlatformUrl },
      ]);
      setNewPlatform('');
      setNewPlatformUrl('');
    }
  };

  // Handle deleting a social media link
  const handleDeleteSocialMedia = (id) => {
    setSocialMediaLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
  };

  // Handle adding a new attribute
  const handleAddAttribute = async () => {
    if (newAttrKey) {
      try {
        const response = await fetch('/api/personAttributes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personId: personData.id,
            key: newAttrKey,
            value: newAttrValue,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.message || 'Error adding attribute');
          return;
        }

        const newAttribute = await response.json();

        // Add the new attribute with the correct id from the response
        setAttributes((prevAttrs) => [...prevAttrs, newAttribute]);

        // Clear input fields
        setNewAttrKey('');
        setNewAttrValue('');
      } catch (error) {
        console.error('Error adding attribute:', error);
        setErrorMessage('Error adding attribute');
      }
    }
  };

  // Handle deleting an attribute
  const handleDeleteAttribute = (id) => {
    setAttributes((prevAttrs) => prevAttrs.filter((attr) => attr.id !== id));
  };

  // Handle attribute value change
  const handleAttributeChange = (id, value) => {
    setAttributes((prevAttrs) =>
      prevAttrs.map((attr) => (attr.id === id ? { ...attr, value } : attr))
    );
  };

  // Handle saving updates to the database
  const handleUpdate = async () => {
    try {
      // Update person data
      const personResponse = await fetch('/api/person', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });

      if (!personResponse.ok) {
        const errorData = await personResponse.json();
        setErrorMessage(errorData.message || 'Error updating person');
        return;
      }

      // Update social media links
      const socialMediaResponse = await fetch('/api/socialmedia', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId: personData.id,
          socialMediaLinks: socialMediaLinks,
        }),
      });

      if (!socialMediaResponse.ok) {
        const errorData = await socialMediaResponse.json();
        setErrorMessage(errorData.message || 'Error updating social media');
        return;
      }

      // Update attributes
      for (const attribute of attributes) {
        if (attribute.id) {
          const attributesResponse = await fetch('/api/personAttributes', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: attribute.id,
              value: attribute.value,
            }),
          });

          if (!attributesResponse.ok) {
            const errorData = await attributesResponse.json();
            setErrorMessage(errorData.message || 'Error updating attribute');
            return;
          }
        }
      }

      setErrorMessage('');
      alert('Person, social media, and attributes updated successfully!');
    } catch (error) {
      console.error('Error updating data:', error);
      setErrorMessage('Error updating data');
    }
  };

  // Render person details
  const renderPersonDetails = () => {
    const fields = [
      'id',
      'type',
      'name',
      'profession',
      'birth_year',
      'birthplace',
      'residence',
      'electoral_district',
      'voting_district',
      'lat',
      'lon',
      'mail',
      'mobile',
      'website',
      'wikipedia',
    ];

    return fields.map((field) => (
      <li key={field}>
        <strong>{field.replace('_', ' ')}:</strong>{' '}
        {admin ? (
          <input
            type="text"
            name={field}
            value={personData[field] || ''}
            onChange={handleInputChange}
            readOnly={field === 'id'}
          />
        ) : field === 'website' || field === 'wikipedia' ? (
          <a href={personData[field]} target="_blank" rel="noopener noreferrer">
            {personData[field]}
          </a>
        ) : (
          personData[field]
        )}
      </li>
    ));
  };

  // Render attributes
  const renderAttributes = () => {
    return attributes.map((attr) => (
      <li key={attr.id}>
        <strong>{attr.key}:</strong>{' '}
        {admin ? (
          <>
            <input
              className={styles.personEdit}
              type="text"
              value={attr.value || ''}
              onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
            />
            <button onClick={() => handleDeleteAttribute(attr.id)}>🗑️</button>
          </>
        ) : (
          attr.value
        )}
      </li>
    ));
  };

  // Render social media links
  const renderSocialMediaLinks = () => {
    if (!Array.isArray(socialMediaLinks)) return null;

    return socialMediaLinks.map((link) => (
      <li key={link.id}>
        {admin ? (
          <>
            <input
              type="text"
              value={link.platform}
              onChange={(e) => {
                const updatedLinks = [...socialMediaLinks];
                const index = updatedLinks.findIndex((l) => l.id === link.id);
                updatedLinks[index].platform = e.target.value;
                setSocialMediaLinks(updatedLinks);
              }}
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => {
                const updatedLinks = [...socialMediaLinks];
                const index = updatedLinks.findIndex((l) => l.id === link.id);
                updatedLinks[index].url = e.target.value;
                setSocialMediaLinks(updatedLinks);
              }}
            />
            <button onClick={() => handleDeleteSocialMedia(link.id)}>🗑️</button>
          </>
        ) : (
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.platform}: {link.url}
          </a>
        )}
      </li>
    ));
  };

  return (
    <div>
      {imageAttribute && imageAttribute.value && (
        <img
          src={imageAttribute.value}
          alt={personData.name}
          className={styles.personImage}
        />
      )}
      <button onClick={() => setAdmin(!admin)}>{admin ? 'View' : 'Edit'}</button>
      <h2>{personData.name}</h2>
      <p>{orgName}</p>
      <ul>{renderPersonDetails()}</ul>

      <h3>Custom Attributes</h3>
      <ul>{renderAttributes()}</ul>
      {admin && (
        <>
          <h4>Add New Attribute</h4>
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
        </>
      )}

      <h3>Social Media</h3>
      <ul>{renderSocialMediaLinks()}</ul>
      {admin && (
        <>
          <h4>Add New Social Media</h4>
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

          <button className={styles.updateButton} onClick={handleUpdate}>Save Changes</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </>
      )}
    </div>
  );
}
