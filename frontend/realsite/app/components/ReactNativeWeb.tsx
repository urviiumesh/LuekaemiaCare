import React from 'react';

// Helper function to ensure style is an object
const ensureStyleIsObject = (style) => {
  if (typeof style === 'string') {
    console.warn('Style prop should be an object, not a string');
    return {}; // Return empty object if style is a string
  }
  return style || {};
};

// Simple React components that mimic React Native components
// These are simplified versions just to make the patient.tsx file work

export const View = ({ style, children, ...props }) => {
  return <div style={ensureStyleIsObject(style)} {...props}>{children}</div>;
};

export const Text = ({ style, children, ...props }) => {
  return <span style={ensureStyleIsObject(style)} {...props}>{children}</span>;
};

export const Image = ({ source, style, ...props }) => {
  return <img src={source?.uri} style={ensureStyleIsObject(style)} {...props} alt="" />;
};

export const TouchableOpacity = ({ style, children, onPress, ...props }) => {
  const safeStyle = ensureStyleIsObject(style);
  return (
    <button
      style={{
        ...safeStyle,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onPress}
      {...props}
    >
      {children}
    </button>
  );
};

export const TextInput = ({ style, value, onChangeText, onChange, ...props }) => {
  // Handle both onChangeText (React Native style) and onChange (React style)
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
    if (onChangeText) {
      onChangeText(e.target.value);
    }
  };

  return (
    <input 
      style={ensureStyleIsObject(style)} 
      value={value} 
      onChange={handleChange}
      {...props} 
    />
  );
};

export const ScrollView = ({ style, children, ...props }) => {
  const safeStyle = ensureStyleIsObject(style);
  return (
    <div
      style={{
        ...safeStyle,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const SafeAreaView = ({ style, children, ...props }) => {
  return <div style={ensureStyleIsObject(style)} {...props}>{children}</div>;
};

export const StatusBar = ({ barStyle, backgroundColor, ...props }) => {
  // This is just a placeholder that doesn't actually render anything
  return null;
};