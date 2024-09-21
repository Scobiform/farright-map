import { useState, useEffect } from 'react';

const InvertToggle = () => {
  const [isInverted, setIsInverted] = useState(false);

  const toggleInvert = () => {
    setIsInverted(!isInverted);
  };

  useEffect(() => {
    if (isInverted) {
      document.body.classList.add('invert');
    } else {
      document.body.classList.remove('invert');
    }
  }, [isInverted]);

  return (
    <button onClick={toggleInvert}>
      {isInverted ? 'Enable Invert' : 'Disable Invert'}
    </button>
  );
};

export default InvertToggle;