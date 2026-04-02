// Test contact form submission
const testContactForm = async () => {
  const testData = {
    data: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with more than 10 characters.'
    }
  };

  console.log('Testing contact form submission...');
  console.log('Sending data:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch('http://localhost:1337/api/contact-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\nResponse status:', response.status);
    console.log('Response status text:', response.statusText);

    const responseData = await response.json();
    console.log('\nResponse data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Contact form is working.');
    } else {
      console.log('\n❌ FAILED! Check the error above.');
      if (response.status === 403) {
        console.log('\n⚠️  403 Forbidden - You need to enable permissions:');
        console.log('   1. Go to Strapi Admin → Settings → Roles → Public');
        console.log('   2. Find "Contact-message" and check "create"');
        console.log('   3. Click Save');
      }
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
};

testContactForm();
