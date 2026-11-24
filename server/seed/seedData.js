// Development seed data. Re-running clears the collections and rebuilds them,
// so the data set is deterministic and safe to reset.
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Amenity = require('../models/Amenity');
const { calculatePrice } = require('../utils/priceCalculator');
const { addDays, toDateOnlyString } = require('../utils/dateHelper');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_booking';

const HOTEL_PHOTOS = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200'
];
const ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900'
];

const AMENITIES = [
  { name: 'WiFi', icon: '📶', category: 'connectivity' },
  { name: 'Pool', icon: '🏊', category: 'leisure' },
  { name: 'Breakfast', icon: '☕', category: 'dining' },
  { name: 'Gym', icon: '🏋️', category: 'fitness' },
  { name: 'Spa', icon: '💆', category: 'wellness' },
  { name: 'Parking', icon: '🅿️', category: 'convenience' },
  { name: 'Air Conditioning', icon: '❄️', category: 'comfort' },
  { name: 'Restaurant', icon: '🍽️', category: 'dining' }
];

const HOTELS = [
  {
    name: 'Aureum Yangon Hotel',
    description: 'A calm retreat in the middle of bustling Yangon.',
    address: '12 Bogyoke Aung San Road, Pabedan',
    city: 'Yangon',
    country: 'Myanmar',
    contact: { phone: '+95 1 234 567', email: 'yangon@aureum.test' }
  },
  {
    name: 'Aureum Mandalay Resort',
    description: 'Modern comfort close to the ancient royal city.',
    address: '45 62nd Road, Chanayethazan',
    city: 'Mandalay',
    country: 'Myanmar',
    contact: { phone: '+95 2 345 678', email: 'mandalay@aureum.test' }
  },
  {
    name: 'Aureum Naypyidaw Lodge',
    description: 'Quiet gardens and spacious suites for a restful stay.',
    address: '8 Pyidaungsu Yeiktha Road, Dekkhina',
    city: 'Naypyidaw',
    country: 'Myanmar',
    contact: { phone: '+95 3 456 789', email: 'naypyidaw@aureum.test' }
  }
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clean slate (includes reviews/payments/bookings that reference old ids).
    await Promise.all([
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({}),
      Amenity.deleteMany({}),
      Hotel.deleteMany({}),
      Room.deleteMany({}),
      User.deleteMany({})
    ]);

    // --- Users -------------------------------------------------------------
    const [adminHash, guestHash, staffHash] = await Promise.all([
      bcrypt.hash('123456', 10),
      bcrypt.hash('123456', 10),
      bcrypt.hash('123456', 10)
    ]);
    const [admin, guest, staff] = await User.insertMany([
      { name: 'Admin User', email: 'admin@test.com', password: adminHash, phone: '0900000001', role: 'admin' },
      { name: 'Guest User', email: 'guest@test.com', password: guestHash, phone: '0900000002', role: 'guest' },
      { name: 'Staff User', email: 'staff@test.com', password: staffHash, phone: '0900000003', role: 'staff' }
    ]);

    // --- Amenities ---------------------------------------------------------
    const amenities = await Amenity.insertMany(AMENITIES);
    const amenityIds = amenities.map((item) => item._id);

    // --- Hotels + rooms ----------------------------------------------------
    const hotelDocs = [];
    const roomDocsByHotel = [];
    const types = ['single', 'double', 'deluxe', 'suite'];

    for (let h = 0; h < HOTELS.length; h += 1) {
      const hotel = await Hotel.create({
        ...HOTELS[h],
        images: HOTEL_PHOTOS,
        rating: 4 + h * 0.2,
        amenities: amenityIds,
        createdBy: admin._id
      });
      hotelDocs.push(hotel);

      const rooms = [];
      for (let i = 0; i < 10; i += 1) {
        const type = types[i % types.length];
        const price = 35000 + ((i * 13000 + h * 5000) % 115000);
        rooms.push({
          hotel: hotel._id,
          roomNumber: String((h + 1) * 100 + i + 1),
          type,
          pricePerNight: price,
          capacity: {
            adults: type === 'single' ? 1 : type === 'suite' ? 4 : 2,
            children: i % 3
          },
          amenities: [amenityIds[0], amenityIds[1 + (i % 7)], amenityIds[(i + 2) % 8]],
          images: [ROOM_PHOTOS[i % ROOM_PHOTOS.length]],
          totalRooms: 2 + ((i + h) % 4),
          isAvailable: true,
          description: `${type[0].toUpperCase()}${type.slice(1)} room at ${hotel.city} with modern furnishings.`
        });
      }
      const insertedRooms = await Room.insertMany(rooms);
      roomDocsByHotel.push(insertedRooms);
    }

    // --- Sample bookings ---------------------------------------------------
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const samples = [
      {
        room: roomDocsByHotel[0][0],
        checkIn: toDateOnlyString(addDays(today, 2)),
        checkOut: toDateOnlyString(addDays(today, 5)),
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'cash'
      },
      {
        room: roomDocsByHotel[1][1],
        checkIn: toDateOnlyString(addDays(today, -1)),
        checkOut: toDateOnlyString(addDays(today, 2)),
        status: 'checked_in',
        paymentStatus: 'paid',
        paymentMethod: 'stripe'
      },
      {
        room: roomDocsByHotel[2][2],
        checkIn: toDateOnlyString(addDays(today, 7)),
        checkOut: toDateOnlyString(addDays(today, 9)),
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'cash'
      }
    ];

    const bookings = [];
    const payments = [];
    for (const sample of samples) {
      const { nights, subtotal, tax, totalPrice } = calculatePrice(
        sample.checkIn,
        sample.checkOut,
        sample.room.pricePerNight
      );
      const booking = await Booking.create({
        user: guest._id,
        hotel: sample.room.hotel,
        room: sample.room._id,
        checkIn: sample.checkIn,
        checkOut: sample.checkOut,
        guests: { adults: 2, children: 0 },
        nights,
        pricePerNight: sample.room.pricePerNight,
        subtotal,
        tax,
        totalPrice,
        status: sample.status,
        paymentStatus: sample.paymentStatus,
        paymentMethod: sample.paymentMethod,
        specialRequests: '',
        cancellationReason: ''
      });
      bookings.push(booking);

      if (sample.paymentStatus === 'paid') {
        payments.push(await Payment.create({
          booking: booking._id,
          user: guest._id,
          amount: totalPrice,
          currency: 'usd',
          stripePaymentIntentId: sample.paymentMethod === 'stripe' ? 'pi_seed_0001' : '',
          status: 'succeeded',
          method: sample.paymentMethod
        }));
      }
    }

    console.log('Seed complete:');
    console.log(`  users:    ${await User.countDocuments()}`);
    console.log(`  amenities:${await Amenity.countDocuments()}`);
    console.log(`  hotels:   ${await Hotel.countDocuments()}`);
    console.log(`  rooms:    ${await Room.countDocuments()}`);
    console.log(`  bookings: ${bookings.length}`);
    console.log(`  payments: ${payments.length}`);
    console.log(`  staff login: staff@test.com / 123456`);
    console.log(`  admin login: admin@test.com / 123456`);
    console.log(`  guest login: guest@test.com / 123456`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
