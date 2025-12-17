export type MemeItem = {
  itemId: string;
  title: string;
  imageUrl: string;
};

const MEMES: MemeItem[] = [
  { itemId: "meme1", title: "meme1", imageUrl: "https://web3.career/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeVJOQWc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--6b7470babffc39c8ae519b40f572e2fd4c3ed6a2/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lKYW5CbFp3WTZCa1ZVT2hSeVpYTnBlbVZmZEc5ZmJHbHRhWFJiQjJrQ0FBUnBBZ0FEIiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--bc95f1a645ed62d5320c353527cf266f294f1a71/remember%20all%20of%20that%20money%20we%20saved%20for%20the%20house.jpeg" },
  { itemId: "meme2", title: "meme2", imageUrl: "https://web3.career/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBelZMQWc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--3196ecb4f0aab7940872d67c96fff786d17fa261/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJQUJHa0NBQU09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--7512606fd1fa5b2ea27d1bd4c5f8aea3534c6eef/should%20I%20sell%20bitcoin.png" },
  { itemId: "meme3", title: "meme3", imageUrl: "https://web3.career/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMlhpQVE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--43eae5f1dacd2d0d7eabacfcad73c45183e18295/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJQUJHa0NBQU09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--a22b0b81a52a2358112baff10d5dd874340abd9e/trading%20crypto.jpg" },
  { itemId: "meme4", title: "meme4", imageUrl: "https://web3.career/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0VMQWc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--c4bba20911f9431954eb6da34eff5996808cb240/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJQUJHa0NBQU09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--a22b0b81a52a2358112baff10d5dd874340abd9e/hodl%202025.jpg" },
  { itemId: "meme5", title: "meme5", imageUrl: "https://lh7-us.googleusercontent.com/-LJUlX8BecLgbjFp8cvKpFCNu8l-8vH8GIESyDISlKZrmT0FW9nwR7wHja4y4tq2XeA0ac348DTWZXV3QycCH-n6vwWji0bAimDW0s6UPeAJyQgRcY0utp_mVdpwPzyH5ipVLNE-_P62O3kjyU0Eeno" },
];

export function getRandomMeme(): MemeItem {
  const idx = Math.floor(Math.random() * MEMES.length);
  return MEMES[idx]!;
}