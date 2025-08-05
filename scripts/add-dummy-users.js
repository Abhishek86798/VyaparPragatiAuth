const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjbTK0gEbpWcj1zfbR81HBgo0VAkJWoDU",
  authDomain: "vyparpragatipro.firebaseapp.com",
  projectId: "vyparpragatipro",
  storageBucket: "vyparpragatipro.firebasestorage.app",
  messagingSenderId: "770210258365",
  appId: "1:770210258365:web:66c6999c0a4d44a02606d4",
  measurementId: "G-SPVYBPKTZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dummy users data
const dummyUsers = [
  {
    id: '+91 98765 43210',
    name: 'Rahul Sharma',
    firm: 'Sharma Enterprises',
    city: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 87654 32109',
    name: 'Priya Patel',
    firm: 'Patel & Co.',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 76543 21098',
    name: 'Amit Kumar',
    firm: 'Kumar Trading',
    city: 'Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 65432 10987',
    name: 'Sneha Reddy',
    firm: 'Reddy Solutions',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 54321 09876',
    name: 'Vikram Singh',
    firm: 'Singh Industries',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 43210 98765',
    name: 'Anjali Desai',
    firm: 'Desai Group',
    city: 'Bangalore',
    district: 'Bangalore',
    state: 'Karnataka',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 32109 87654',
    name: 'Rajesh Verma',
    firm: 'Verma Exports',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 21098 76543',
    name: 'Meera Iyer',
    firm: 'Iyer Technologies',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 10987 65432',
    name: 'Arun Malhotra',
    firm: 'Malhotra Services',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    createdAt: new Date().toISOString()
  },
  {
    id: '+91 09876 54321',
    name: 'Kavita Joshi',
    firm: 'Joshi Consultants',
    city: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    createdAt: new Date().toISOString()
  }
];

async function addDummyUsers() {
  try {
    console.log('🚀 Starting to add dummy users to Firebase...');
    
    const usersCollection = collection(db, 'users');
    let successCount = 0;
    let errorCount = 0;

    for (const user of dummyUsers) {
      try {
        // Use the phone number as the document ID
        const userDoc = doc(db, 'users', user.id);
        await setDoc(userDoc, user);
        console.log(`✅ Added user: ${user.name} (${user.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add user ${user.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully added: ${successCount} users`);
    console.log(`❌ Failed to add: ${errorCount} users`);
    console.log(`📱 Total users in database: ${successCount + errorCount}`);
    
    if (successCount > 0) {
      console.log('\n🎯 Test users available:');
      dummyUsers.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - ${user.id} (${user.firm})`);
      });
      console.log('... and more!');
    }

  } catch (error) {
    console.error('❌ Error adding dummy users:', error);
  }
}

// Run the script
addDummyUsers()
  .then(() => {
    console.log('\n🎉 Dummy users script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 