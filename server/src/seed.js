import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MONGO_URI } from "./config/env.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import Story from "./models/Story.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import Notification from "./models/Notification.js";

// ---- Sample Data ----

const users = [
  {
    username: "alex_photo",
    email: "alex@test.com",
    password: "password123",
    fullName: "Alex Johnson",
    bio: "📸 Photography enthusiast | Travel lover | Coffee addict",
    website: "https://alexjohnson.com",
    gender: "male",
  },
  {
    username: "sara_designs",
    email: "sara@test.com",
    password: "password123",
    fullName: "Sara Williams",
    bio: "🎨 UI/UX Designer | Creating beautiful experiences",
    website: "https://sarawilliams.design",
    gender: "female",
  },
  {
    username: "mike_codes",
    email: "mike@test.com",
    password: "password123",
    fullName: "Mike Chen",
    bio: "💻 Full Stack Developer | Open source contributor",
    website: "https://mikechen.dev",
    gender: "male",
  },
  {
    username: "priya_travels",
    email: "priya@test.com",
    password: "password123",
    fullName: "Priya Sharma",
    bio: "✈️ Solo traveler | 40+ countries | Food blogger",
    website: "https://priyatravels.com",
    gender: "female",
  },
  {
    username: "james_fitness",
    email: "james@test.com",
    password: "password123",
    fullName: "James Miller",
    bio: "💪 Fitness coach | Helping you reach your goals",
    website: "https://jamesfitness.com",
    gender: "male",
  },
  {
    username: "luna_art",
    email: "luna@test.com",
    password: "password123",
    fullName: "Luna Park",
    bio: "🌙 Digital artist | Illustrator | Dream chaser",
    gender: "female",
  },
  {
    username: "dev_user",
    email: "dev@test.com",
    password: "password123",
    fullName: "Dev User",
    bio: "🚀 This is your main test account",
    gender: "male",
  },
];

// Real images from Unsplash (no API key needed)
const postImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800",
  "https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?w=800",
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800",
  "https://images.unsplash.com/photo-1682687221038-404670f09439?w=800",
  "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800",
];

const avatarImages = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
];

const postCaptions = [
  "Golden hour never disappoints 🌅 #photography #sunset #nature",
  "Exploring hidden gems around the world ✈️ #travel #adventure #wanderlust",
  "The mountains are calling and I must go 🏔️ #hiking #outdoors #explore",
  "Lost in the beauty of nature 🌿 #naturephotography #peaceful #breathtaking",
  "Every sunset brings the promise of a new dawn 🌄 #sunset #hope #photography",
  "Adventure awaits around every corner 🗺️ #travel #explore #adventure",
  "Finding peace in the wilderness 🌲 #nature #forest #mindfulness",
  "The world is a book and those who do not travel read only one page 📖 #travel #quote",
  "Chasing waterfalls and good vibes 💦 #waterfall #nature #vibes",
  "Living for moments like these ✨ #lifestyle #moments #grateful",
  "New places, new faces, new experiences 🌍 #travel #culture #explore",
  "Nature is the best therapy 🌺 #nature #therapy #peace",
];

const commentTexts = [
  "This is absolutely stunning! 😍",
  "Wow, incredible shot! 📸",
  "I need to visit this place! 🌍",
  "Beautiful capture! Keep it up 👏",
  "This made my day so much better ❤️",
  "Goals! Absolutely love this 🔥",
  "The colors are just perfect 🎨",
  "This is breathtaking! 😮",
  "Amazing as always! 💯",
  "Love love love this! 💖",
  "Can't stop looking at this 👀",
  "Pure magic ✨",
];

// ---- Helper Functions ----

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomItems = (arr, min, max) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ---- Main Seed Function ----

const seedDatabase = async () => {
  try {
    // Connect to DB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // ---- Clear existing data ----
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Story.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log("Existing data cleared");

    // ---- Create Users ----
    console.log("Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 12);

    const createdUsers = await User.insertMany(
      users.map((user, index) => ({
        ...user,
        password: hashedPassword,
        avatar: {
          public_id: `seed/avatar_${index}`,
          url: avatarImages[index],
        },
        coverImage: {
          public_id: `seed/cover_${index}`,
          url: postImages[index % postImages.length],
        },
        isVerified: true,
        isActive: true,
      })),
    );
    console.log(`Created ${createdUsers.length} users`);

    // ---- Create Follow Relationships ----
    console.log("Creating follow relationships...");

    // Everyone follows dev_user (index 6) and dev_user follows everyone
    const devUser = createdUsers[6];

    for (let i = 0; i < createdUsers.length - 1; i++) {
      const userA = createdUsers[i];
      const userB = createdUsers[(i + 1) % (createdUsers.length - 1)];

      // Consecutive users follow each other
      await Promise.all([
        User.findByIdAndUpdate(userA._id, {
          $addToSet: { following: userB._id },
        }),
        User.findByIdAndUpdate(userB._id, {
          $addToSet: { followers: userA._id },
        }),
        // dev_user follows everyone
        User.findByIdAndUpdate(devUser._id, {
          $addToSet: { following: userA._id },
        }),
        User.findByIdAndUpdate(userA._id, {
          $addToSet: { followers: devUser._id },
        }),
      ]);
    }

    // Some random additional follows
    for (let i = 0; i < createdUsers.length; i++) {
      const randomFollowing = randomItems(
        createdUsers.filter(
          (u) => u._id.toString() !== createdUsers[i]._id.toString(),
        ),
        1,
        3,
      );

      for (const target of randomFollowing) {
        await Promise.all([
          User.findByIdAndUpdate(createdUsers[i]._id, {
            $addToSet: { following: target._id },
          }),
          User.findByIdAndUpdate(target._id, {
            $addToSet: { followers: createdUsers[i]._id },
          }),
        ]);
      }
    }
    console.log("Follow relationships created");

    // ---- Create Posts ----
    console.log("Creating posts...");
    const createdPosts = [];

    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const postCount = randomInt(2, 4);

      for (let j = 0; j < postCount; j++) {
        const caption = randomItem(postCaptions);
        const imageUrl = postImages[(i * 2 + j) % postImages.length];

        // Extract hashtags from caption
        const hashtags = [...caption.matchAll(/#(\w+)/g)].map((match) =>
          match[1].toLowerCase(),
        );

        const post = await Post.create({
          author: user._id,
          caption,
          hashtags,
          location: randomItem([
            "Kolkata, India",
            "Mumbai, India",
            "Delhi, India",
            "Bangalore, India",
            "Paris, France",
            "New York, USA",
            "Tokyo, Japan",
            "London, UK",
          ]),
          media: [
            {
              public_id: `seed/post_${i}_${j}`,
              url: imageUrl,
              mediaType: "image",
            },
          ],
        });

        createdPosts.push(post);
      }
    }
    console.log(`Created ${createdPosts.length} posts`);

    // ---- Add Likes to Posts ----
    console.log("Adding likes...");

    for (const post of createdPosts) {
      const likers = randomItems(createdUsers, 2, 5);

      await Post.findByIdAndUpdate(post._id, {
        $addToSet: { likes: { $each: likers.map((u) => u._id) } },
      });
    }
    console.log("Likes added");

    // ---- Add Comments to Posts ----
    console.log("Adding comments...");
    const createdComments = [];

    for (const post of createdPosts) {
      const commentCount = randomInt(1, 3);

      for (let i = 0; i < commentCount; i++) {
        const commenter = randomItem(createdUsers);
        const text = randomItem(commentTexts);

        const comment = await Comment.create({
          post: post._id,
          author: commenter._id,
          text,
          likes: randomItems(createdUsers, 0, 3).map((u) => u._id),
        });

        await Post.findByIdAndUpdate(post._id, {
          $addToSet: { comments: comment._id },
        });

        createdComments.push(comment);
      }
    }
    console.log(`Created ${createdComments.length} comments`);

    // ---- Add Replies to Some Comments ----
    console.log("Adding replies...");

    const commentsToReply = randomItems(createdComments, 3, 6);

    for (const comment of commentsToReply) {
      const replier = randomItem(createdUsers);

      const reply = await Comment.create({
        post: comment.post,
        author: replier._id,
        text: randomItem(commentTexts),
        parentComment: comment._id,
      });

      await Comment.findByIdAndUpdate(comment._id, {
        $addToSet: { replies: reply._id },
      });
    }
    console.log("Replies added");

    // ---- Create Stories ----
    console.log("Creating stories...");

    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const storyCount = randomInt(1, 3);

      for (let j = 0; j < storyCount; j++) {
        const story = await Story.create({
          author: user._id,
          media: {
            public_id: `seed/story_${i}_${j}`,
            url: postImages[(i + j) % postImages.length],
            mediaType: "image",
          },
          text: randomItem([
            "",
            "Good morning! ☀️",
            "Having a great day! 🌟",
            "Adventure time! 🗺️",
            "",
          ]),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          viewers: randomItems(createdUsers, 1, 3).map((u) => ({
            user: u._id,
            viewedAt: new Date(),
          })),
        });
      }
    }
    console.log("Stories created");

    // ---- Create Conversations and Messages ----
    console.log("Creating conversations and messages...");

    const conversationPairs = [
      [0, 1],
      [0, 2],
      [1, 2],
      [6, 0],
      [6, 1],
      [6, 2],
      [6, 3],
    ];

    const messageTexts = [
      "Hey! How are you doing?",
      "I love your latest post! 😍",
      "We should collaborate sometime!",
      "Thanks for the follow! 🙏",
      "Your photography is incredible!",
      "Have you been to Bali? It's amazing!",
      "What camera do you use?",
      "Great work as always! 💯",
      "Let's catch up soon!",
      "Just saw your story — looks fun!",
    ];

    for (const [indexA, indexB] of conversationPairs) {
      const userA = createdUsers[indexA];
      const userB = createdUsers[indexB];

      const conversation = await Conversation.create({
        participants: [userA._id, userB._id],
        isGroup: false,
      });

      const msgCount = randomInt(3, 6);
      let lastMessage;

      for (let i = 0; i < msgCount; i++) {
        const sender = i % 2 === 0 ? userA : userB;
        const text = randomItem(messageTexts);

        const message = await Message.create({
          conversation: conversation._id,
          sender: sender._id,
          text,
          seenBy: [userA._id, userB._id],
        });

        lastMessage = message;
      }

      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: lastMessage._id,
      });
    }
    console.log("Conversations and messages created");

    // ---- Create Notifications ----
    console.log("Creating notifications...");

    // Like notifications for dev_user
    for (const post of createdPosts.slice(0, 5)) {
      const liker = randomItem(createdUsers.slice(0, 6));

      await Notification.create({
        receiver: devUser._id,
        sender: liker._id,
        type: "like",
        post: post._id,
        isRead: false,
      });
    }

    // Follow notifications for dev_user
    for (let i = 0; i < 3; i++) {
      await Notification.create({
        receiver: devUser._id,
        sender: createdUsers[i]._id,
        type: "follow",
        isRead: false,
      });
    }

    // Comment notifications for dev_user
    for (const comment of createdComments.slice(0, 3)) {
      await Notification.create({
        receiver: devUser._id,
        sender: randomItem(createdUsers.slice(0, 6))._id,
        type: "comment",
        post: comment.post,
        comment: comment._id,
        isRead: false,
      });
    }

    console.log("Notifications created");

    // ---- Add Bookmarks to Dev User ----
    console.log("Adding bookmarks...");

    const bookmarkPosts = randomItems(createdPosts, 3, 5);
    await User.findByIdAndUpdate(devUser._id, {
      bookmarks: bookmarkPosts.map((p) => p._id),
    });
    console.log("Bookmarks added");

    // ---- Summary ----
    console.log("\n=============================");
    console.log("✅ SEED COMPLETED SUCCESSFULLY");
    console.log("=============================");
    console.log(`Users        : ${createdUsers.length}`);
    console.log(`Posts        : ${createdPosts.length}`);
    console.log(`Comments     : ${createdComments.length}`);
    console.log(`Conversations: ${conversationPairs.length}`);
    console.log("=============================");
    console.log("\n🔑 LOGIN CREDENTIALS (all same password)");
    console.log("=============================");

    createdUsers.forEach((user) => {
      console.log(`${user.username.padEnd(15)} → ${user.email}`);
    });

    console.log("\nPassword for all accounts: password123");
    console.log("\n🚀 Main test account: dev@test.com / password123");
    console.log("=============================\n");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};

seedDatabase();
