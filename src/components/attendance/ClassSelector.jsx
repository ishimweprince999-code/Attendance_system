import React from 'react';

const CLASS_LEVELS = {
  O_LEVEL: ['S1', 'S2', 'S3'],
  ACC: ['S4', 'S5', 'S6'],
  SOD: ['L3', 'L4', 'L5']
};

const ClassSelector = ({ selectedClass, onClassChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Select Class</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">O Level</h3>
          <div className="space-y-2">
            {CLASS_LEVELS.O_LEVEL.map(className => (
              <button
                key={className}
                onClick={() => onClassChange(className)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  selectedClass === className 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">ACC</h3>
          <div className="space-y-2">
            {CLASS_LEVELS.ACC.map(className => (
              <button
                key={className}
                onClick={() => onClassChange(className)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  selectedClass === className 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-300'
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-3 border-b pb-2">SOD</h3>
          <div className="space-y-2">
            {CLASS_LEVELS.SOD.map(className => (
              <button
                key={className}
                onClick={() => onClassChange(className)}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  selectedClass === className 
                    ? 'bg-purple-500 text-white border-purple-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSelector;