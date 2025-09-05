// Simple test to verify recharts can be imported
try {
  import { BarChart } from 'recharts';
  console.log('✅ recharts imported successfully');
} catch (error) {
  console.log('❌ recharts import failed:', error.message);
}