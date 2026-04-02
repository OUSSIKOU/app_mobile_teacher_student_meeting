const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testServer() {
  console.log('🧪 Testing Easy Study Server...\n');

  try {
    // Test 1: Server health check
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is running:', healthResponse.data.message);

    // Test 2: Register a test user
    console.log('\n2. Testing user registration...');
    const registerData = {
      name: 'Test Teacher',
      email: 'test@teacher.com',
      password: 'password123',
      role: 'teacher'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
      console.log('✅ User registration successful');
      
      // Test 3: Login with the registered user
      console.log('\n3. Testing user login...');
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: registerData.email,
        password: registerData.password
      });
      console.log('✅ User login successful');
      
      const token = loginResponse.data.token;
      
      // Test 4: Get current user
      console.log('\n4. Testing get current user...');
      const userResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Get current user successful:', userResponse.data.user.name);
      
      // Test 5: Create a meeting
      console.log('\n5. Testing meeting creation...');
      const meetingData = {
        title: 'Test Math Class',
        description: 'A test mathematics class',
        subject: 'Mathematics',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 60,
        maxStudents: 20
      };
      
      const meetingResponse = await axios.post(`${BASE_URL}/api/meetings`, meetingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Meeting creation successful:', meetingResponse.data.meeting.title);
      
      // Test 6: Get meetings
      console.log('\n6. Testing get meetings...');
      const meetingsResponse = await axios.get(`${BASE_URL}/api/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Get meetings successful. Found', meetingsResponse.data.meetings.length, 'meetings');
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, testing login...');
        
        // Test login with existing user
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: registerData.email,
          password: registerData.password
        });
        console.log('✅ Login with existing user successful');
        
        const token = loginResponse.data.token;
        
        // Test get meetings with existing user
        const meetingsResponse = await axios.get(`${BASE_URL}/api/meetings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Get meetings successful. Found', meetingsResponse.data.meetings.length, 'meetings');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All tests passed! Server is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.error('\nMake sure:');
    console.error('1. MongoDB is running');
    console.error('2. Server is started with "npm run dev"');
    console.error('3. Environment variables are set correctly');
  }
}

// Run the test
testServer();
