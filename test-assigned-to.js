console.log('Testing updated assigned_to validation mapping...');

// Updated mapping function - now accepts any valid user
const mapAssignedTo = (value) => {
  if (!value || value === '') return '';
  // Return the value as-is since we now accept any valid user
  return value;
};

// Test cases
const testCases = [
  'Kim Smith',
  'kim',
  'KIM',
  'Patrick Johnson',
  'patrick',
  'PATRICK',
  'Lina Rodriguez',
  'lina',
  'LINA',
  'John Doe',
  'Alice Johnson',
  'Bob Wilson',
  '',
  null,
  undefined
];

console.log('Testing assigned_to mapping (now accepts any valid user):');
testCases.forEach(test => {
  const result = mapAssignedTo(test);
  console.log(`Input: "${test}" -> Output: "${result}"`);
});

console.log('\nSchema now accepts any non-empty string for assigned_to');
